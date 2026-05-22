-- Migration: Fix Admin Role Management 500 & SECURITY DEFINER Hardening
-- Root Cause: SECURITY DEFINER functions missing SET search_path = public and ENUM cast fragility.

-- 1. Governance ENUM Resilience (Audit Logs)
-- Convert role_change_logs to use TEXT to prevent ENUM synchronization issues
ALTER TABLE public.role_change_logs ALTER COLUMN old_role TYPE TEXT;
ALTER TABLE public.role_change_logs ALTER COLUMN new_role TYPE TEXT;

-- 2. SECURITY DEFINER Hardening & Enum Resilience in Triggers
-- Adding SET search_path = public to ALL active security definer functions

-- A. Role Management Governance (Refactored to use TEXT internally)
CREATE OR REPLACE FUNCTION public.enforce_role_management()
RETURNS trigger AS $$
DECLARE
    current_user_id uuid := auth.uid();
    current_user_role text; -- Using text for resilience
BEGIN
    -- If role is not being changed, just return
    IF OLD.role IS NOT DISTINCT FROM NEW.role THEN
        RETURN NEW;
    END IF;

    -- Allow Service Role to do anything (auth.uid() is null or role is service_role)
    IF current_user_id IS NULL OR auth.role() = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Get requester's role
    SELECT role INTO current_user_role FROM public.profiles WHERE id = current_user_id;

    -- super_admin can do everything
    IF current_user_role = 'super_admin' THEN
        -- Prevent self-demotion if it's the last super_admin (safety check)
        IF OLD.id = current_user_id AND NEW.role != 'super_admin' THEN
            IF (SELECT count(*) FROM public.profiles WHERE role = 'super_admin') <= 1 THEN
                RAISE EXCEPTION 'Não é possível remover o último Super Administrador da plataforma.';
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- admin can promote/demote reviewer <-> customer
    IF current_user_role = 'admin' THEN
        -- Check if target user is admin or super_admin
        IF OLD.role IN ('admin', 'super_admin') THEN
            RAISE EXCEPTION 'Administradores não podem alterar permissões de outros administradores ou super administradores.';
        END IF;

        -- Check if new role is admin or super_admin
        IF NEW.role IN ('admin', 'super_admin') THEN
            RAISE EXCEPTION 'Administradores não podem promover usuários para Admin ou Super Admin.';
        END IF;

        -- Check if user is trying to change their own role
        IF OLD.id = current_user_id THEN
            RAISE EXCEPTION 'Administradores não podem alterar suas próprias permissões.';
        END IF;

        RETURN NEW;
    END IF;

    -- Allow user to self-upgrade from reviewer to customer (onboarding flow)
    IF OLD.id = current_user_id AND OLD.role = 'reviewer' AND NEW.role = 'customer' THEN
        RETURN NEW;
    END IF;

    -- Any other role is unauthorized
    RAISE EXCEPTION 'Permissão negada. Você não tem autoridade para gerenciar papéis de usuário.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public.role_change_logs (actor_id, target_id, old_role, new_role)
        VALUES (auth.uid(), NEW.id, OLD.role, NEW.role);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. Analytics & Anti-Spam (Hardening)
CREATE OR REPLACE FUNCTION public.deduplicate_analytics_events()
RETURNS trigger AS $$
DECLARE
    recent_exists boolean;
BEGIN
    IF NEW.fingerprint is not null THEN
        SELECT exists (
            SELECT 1 FROM public.analytics_events
            WHERE business_id is not distinct from new.business_id
              AND event_type = new.event_type
              AND fingerprint = new.fingerprint
              AND link_id is not distinct from new.link_id
              AND created_at > now() - interval '15 minutes'
        ) INTO recent_exists;
          
        IF recent_exists THEN
            RETURN NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_review_abuse(
    target_business_id uuid,
    target_fingerprint text,
    target_feedback text default null
)
RETURNS boolean AS $$
DECLARE
    recent_count integer;
    duplicate_content boolean;
BEGIN
    SELECT count(*) INTO recent_count
    FROM public.reviews
    WHERE business_id = target_business_id
      AND submission_fingerprint = target_fingerprint
      AND created_at > now() - interval '60 minutes';

    IF recent_count > 0 THEN
        RETURN false;
    END IF;

    IF target_feedback is not null AND length(trim(target_feedback)) > 0 THEN
        SELECT exists (
            SELECT 1 FROM public.reviews
            WHERE submission_fingerprint = target_fingerprint
              AND feedback = target_feedback
              AND created_at > now() - interval '10 minutes'
        ) INTO duplicate_content;

        IF duplicate_content THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.enforce_review_abuse_protection()
RETURNS trigger AS $$
BEGIN
    IF NOT public.check_review_abuse(new.business_id, new.submission_fingerprint, new.feedback) THEN
        RAISE EXCEPTION 'Você já enviou uma avaliação recentemente para esta empresa. Tente novamente em alguns minutos.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- C. Verification System (Hardening)
CREATE OR REPLACE FUNCTION public.check_business_verification_eligibility()
RETURNS trigger AS $$
DECLARE
    has_google_review boolean;
    has_social_links boolean;
    page_id_var uuid;
BEGIN
    SELECT id INTO page_id_var FROM public.business_pages WHERE business_id = new.business_id LIMIT 1;
    IF page_id_var is null THEN
        RAISE EXCEPTION 'Empresa não possui uma página configurada. Configure sua página antes de solicitar verificação.';
    END IF;
    SELECT exists (SELECT 1 FROM public.page_links WHERE page_id = page_id_var AND type = 'google_review' AND is_active = true) INTO has_google_review;
    IF not has_google_review THEN
        RAISE EXCEPTION 'Link do Google Review não configurado. Este item é obrigatório para verificação.';
    END IF;
    SELECT exists (SELECT 1 FROM public.page_links WHERE page_id = page_id_var AND type != 'google_review' AND is_active = true) INTO has_social_links;
    IF not has_social_links THEN
        RAISE EXCEPTION 'Você precisa configurar pelo menos um link social ou de contato (WhatsApp, Instagram, etc.) antes de solicitar verificação.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.sync_business_verification()
RETURNS trigger AS $$
BEGIN
  IF new.verification_status = 'approved' AND (old.verification_status IS NULL OR old.verification_status != 'approved') THEN
    new.is_verified := true;
    IF new.verified_at IS NULL THEN new.verified_at := now(); END IF;
    IF new.verified_by IS NULL THEN new.verified_by := auth.uid(); END IF;
  ELSIF new.verification_status != 'approved' AND (old.verification_status = 'approved') THEN
    new.is_verified := false;
    new.verified_at := null;
    new.verified_by := null;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- D. Auth & Profiles (Hardening)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, terms_accepted_at, terms_version, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.raw_user_meta_data->>'terms_accepted_at' IS NOT NULL 
      THEN (new.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ 
      ELSE NULL 
    END,
    new.raw_user_meta_data->>'terms_version',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- E. Review Feed & Stats (Hardening)
CREATE OR REPLACE FUNCTION public.get_business_reviews_with_stats(
    b_id uuid,
    p_limit integer DEFAULT 5,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    rating integer,
    feedback text,
    display_name text,
    created_at timestamp with time zone,
    user_id uuid,
    author_role text,
    author_review_count bigint,
    response_id uuid,
    response_content text,
    response_author_role text, -- Changed to text for resilience
    response_created_at timestamp with time zone,
    total_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.business_id,
        r.rating,
        r.feedback,
        r.display_name,
        r.created_at,
        r.user_id,
        p.role::text as author_role,
        COALESCE(s.approved_reviews_count, 0)::bigint as author_review_count,
        rr.id as response_id,
        rr.content as response_content,
        rr.author_role::text as response_author_role,
        rr.created_at as response_created_at,
        COUNT(*) OVER() as total_count
    FROM 
        public.reviews r
    LEFT JOIN 
        public.profiles p ON r.user_id = p.id
    LEFT JOIN 
        public.reviewer_stats s ON r.user_id = s.user_id
    LEFT JOIN
        public.review_responses rr ON r.id = rr.review_id AND rr.deleted_at IS NULL
    WHERE 
        r.business_id = b_id
        AND NOT public.is_suspended(r.user_id)
        AND NOT public.is_business_frozen(r.business_id)
    ORDER BY 
        r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_business_reviews_with_stats(b_id uuid)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    rating integer,
    feedback text,
    display_name text,
    created_at timestamp with time zone,
    user_id uuid,
    author_role text,
    author_review_count bigint,
    response_id uuid,
    response_content text,
    response_author_role text,
    response_created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.business_id,
        r.rating,
        r.feedback,
        r.display_name,
        r.created_at,
        r.user_id,
        p.role::text as author_role,
        COALESCE(s.approved_reviews_count, 0)::bigint as author_review_count,
        rr.id as response_id,
        rr.content as response_content,
        rr.author_role::text as response_author_role,
        rr.created_at as response_created_at
    FROM 
        public.reviews r
    LEFT JOIN 
        public.profiles p ON r.user_id = p.id
    LEFT JOIN 
        public.reviewer_stats s ON r.user_id = s.user_id
    LEFT JOIN
        public.review_responses rr ON r.id = rr.review_id AND rr.deleted_at IS NULL
    WHERE 
        r.business_id = b_id
        AND NOT public.is_suspended(r.user_id)
        AND NOT public.is_business_frozen(r.business_id)
    ORDER BY 
        r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- F. Moderation & Others (Hardening)
CREATE OR REPLACE FUNCTION public.process_user_warning()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles SET warning_count = warning_count + 1, account_status = 'warned', updated_at = now() WHERE id = NEW.target_user_id;
  INSERT INTO public.notifications (user_id, title, message, type) VALUES (NEW.target_user_id, 'Aviso de Moderação', 'Você recebeu um aviso formal: ' || NEW.reason, 'warning');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_moderation_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.action_type = 'deactivation' THEN
    UPDATE public.profiles SET is_deleted = true, deleted_at = now(), updated_at = now() WHERE id = NEW.target_user_id;
    UPDATE public.businesses SET is_frozen = true, frozen_at = now(), frozen_reason = 'Conta desativada pelo administrador: ' || NEW.reason WHERE owner_id = NEW.target_user_id AND is_frozen = false;
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (NEW.target_user_id, 'Sua conta foi desativada', 'Sua conta foi desativada por um administrador. Motivo: ' || NEW.reason, 'error');
  ELSIF NEW.action_type = 'ban' THEN
    UPDATE public.profiles SET account_status = 'banned', banned_at = now(), banned_reason = NEW.reason, updated_at = now() WHERE id = NEW.target_user_id;
    UPDATE public.businesses SET is_frozen = true, frozen_at = now(), frozen_reason = 'Proprietário banido permanentemente: ' || NEW.reason WHERE owner_id = NEW.target_user_id AND is_frozen = false;
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (NEW.target_user_id, 'Sua conta foi banida permanentemente', 'Sua conta foi permanentemente banida da plataforma. Motivo: ' || NEW.reason, 'error');
  ELSIF NEW.action_type = 'suspension' THEN
    UPDATE public.profiles SET account_status = 'suspended', suspended_until = (NEW.metadata->>'suspended_until')::timestamp with time zone, updated_at = now() WHERE id = NEW.target_user_id;
    UPDATE public.businesses SET is_frozen = true, frozen_at = now(), frozen_reason = 'Proprietário suspenso: ' || NEW.reason WHERE owner_id = NEW.target_user_id AND is_frozen = false;
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (NEW.target_user_id, 'Sua conta foi suspensa', 'Sua conta foi temporariamente suspensa até ' || to_char((NEW.metadata->>'suspended_until')::timestamp with time zone, 'DD/MM/YYYY HH24:MI') || '. Motivo: ' || NEW.reason, 'error');
  ELSIF NEW.action_type = 'reactivation' THEN
    UPDATE public.profiles SET account_status = 'active', suspended_until = null, banned_at = null, banned_reason = null, is_deleted = false, deleted_at = null, updated_at = now() WHERE id = NEW.target_user_id;
    UPDATE public.businesses SET is_frozen = false, frozen_at = null, frozen_reason = null WHERE owner_id = NEW.target_user_id AND (frozen_reason LIKE 'Proprietário suspenso%' OR frozen_reason LIKE 'Proprietário banido%' OR frozen_reason LIKE 'Conta desativada%');
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (NEW.target_user_id, 'Conta Reativada/Reativada', 'Sua conta foi reativada por um administrador. Bem-vindo de volta!', 'success');
  ELSIF NEW.action_type = 'freeze' THEN
    UPDATE public.businesses SET is_frozen = true, frozen_at = now(), frozen_reason = NEW.reason WHERE id = (NEW.metadata->>'business_id')::uuid;
  ELSIF NEW.action_type = 'unfreeze' THEN
    UPDATE public.businesses SET is_frozen = false, frozen_at = null, frozen_reason = null WHERE id = (NEW.metadata->>'business_id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_appeal_resolution()
RETURNS trigger AS $$
DECLARE
  v_action_type text;
  v_target_user_id uuid;
  v_metadata jsonb;
BEGIN
  IF NEW.status = OLD.status OR NEW.status NOT IN ('approved', 'rejected') THEN RETURN NEW; END IF;
  SELECT action_type, target_user_id, metadata INTO v_action_type, v_target_user_id, v_metadata FROM public.moderation_actions WHERE id = NEW.moderation_action_id;
  IF NEW.status = 'approved' THEN
    INSERT INTO public.moderation_actions (target_user_id, admin_user_id, action_type, reason, metadata)
    VALUES (v_target_user_id, NEW.reviewed_by, CASE WHEN v_action_type = 'warning' THEN 'reactivation' WHEN v_action_type = 'suspension' THEN 'reactivation' WHEN v_action_type = 'ban' THEN 'reactivation' WHEN v_action_type = 'freeze' THEN 'unfreeze' ELSE 'reactivation' END, 'Apelação aprovada: ' || NEW.admin_response, v_metadata);
    IF v_action_type = 'warning' THEN UPDATE public.profiles SET warning_count = GREATEST(0, warning_count - 1) WHERE id = v_target_user_id; END IF;
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (v_target_user_id, 'Sua apelação foi aprovada', 'Após revisão, a ação de moderação foi revertida. ' || COALESCE(NEW.admin_response, ''), 'success');
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, title, message, type) VALUES (v_target_user_id, 'Sua apelação foi rejeitada', 'Após revisão, a ação de moderação foi mantida. ' || COALESCE(NEW.admin_response, ''), 'error');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_slug_available(slug_to_check text, exclude_business_id uuid default null)
RETURNS boolean AS $$
DECLARE
  is_reserved boolean;
  business_exists boolean;
BEGIN
  is_reserved := lower(slug_to_check) = any(array['admin', 'dashboard', 'login', 'register', 'api', 'blocked', 'terms-reaccept', 'privacy', 'terms', 'auth', 'reset-password', 'forgot-password', 'favicon.ico', 'sitemap.xml', 'robots.txt', 'demo', 'demonstracao', 'new', 'edit', 'delete', 'settings', 'support', 'help', 'pricing', 'about', 'contact']);
  IF is_reserved THEN RETURN false; END IF;
  IF exclude_business_id is not null THEN
    SELECT exists(SELECT 1 FROM businesses WHERE lower(slug) = lower(slug_to_check) AND id != exclude_business_id) INTO business_exists;
  ELSE
    SELECT exists(SELECT 1 FROM businesses WHERE lower(slug) = lower(slug_to_check)) INTO business_exists;
  END IF;
  IF business_exists THEN RETURN false; END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.notify_reviewer_on_response()
RETURNS trigger AS $$
DECLARE
    v_reviewer_id uuid;
    v_biz_name text;
BEGIN
    SELECT r.user_id, b.name INTO v_reviewer_id, v_biz_name FROM public.reviews r JOIN public.businesses b ON b.id = r.business_id WHERE r.id = NEW.review_id;
    IF v_reviewer_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (v_reviewer_id, 'Sua avaliação recebeu uma resposta', 'A empresa ' || v_biz_name || ' enviou uma resposta oficial ao seu comentário.', 'info');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_admin_business_verification()
RETURNS trigger AS $$
DECLARE
  creator_role text;
BEGIN
  SELECT role INTO creator_role FROM public.profiles WHERE id = auth.uid();
  IF creator_role = 'admin' OR creator_role = 'super_admin' THEN
    new.is_verified := true;
    new.verification_status := 'approved';
    new.verified_at := now();
    new.verified_by := auth.uid();
  ELSE
    new.is_verified := false;
    new.verification_status := 'pending';
    new.verified_at := null;
    new.verified_by := null;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_business_verification_initial_state()
RETURNS trigger AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT (role = 'admin' OR role = 'super_admin') INTO is_admin_user FROM public.profiles WHERE id = auth.uid();
  IF (TG_OP = 'INSERT') THEN
    IF (is_admin_user is true) THEN
      new.verification_status := 'approved';
      new.is_verified := true;
      new.verified_at := now();
      new.verified_by := auth.uid();
    ELSE
      new.verification_status := 'pending';
      new.is_verified := false;
      new.verified_at := null;
      new.verified_by := null;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
