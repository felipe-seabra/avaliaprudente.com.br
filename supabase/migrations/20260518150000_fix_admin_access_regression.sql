-- Stabilization Migration: Fix Admin Access Regression

-- 1. Update is_suspended to bypass for admins
CREATE OR REPLACE FUNCTION public.is_suspended(u_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Admins are NEVER considered suspended for system checks
  -- This ensures they can always access their own data via RLS
  IF public.is_admin(u_id) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = u_id
    AND account_status = 'suspended'
    AND (suspended_until IS NULL OR suspended_until > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update is_business_frozen to bypass for admins
CREATE OR REPLACE FUNCTION public.is_business_frozen(b_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Admins can always see/manage frozen businesses
  IF public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = b_id
    AND is_frozen = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Prevent self-suspension in process_moderation_escalation
CREATE OR REPLACE FUNCTION public.process_moderation_escalation()
RETURNS trigger AS $$
BEGIN
  -- Safety check: Prevent self-suspension
  IF NEW.target_user_id = NEW.admin_user_id AND NEW.action_type = 'suspension' THEN
    RAISE EXCEPTION 'Um administrador não pode suspender a própria conta.';
  END IF;

  -- If ACTION is SUSPENSION
  IF NEW.action_type = 'suspension' THEN
    -- Update profile status
    UPDATE public.profiles
    SET 
      account_status = 'suspended',
      suspended_until = (NEW.metadata->>'suspended_until')::timestamp with time zone,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    -- Freeze all businesses owned by this user
    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = 'Proprietário suspenso: ' || NEW.reason
    WHERE owner_id = NEW.target_user_id AND is_frozen = false;

    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Sua conta foi suspensa',
      'Sua conta foi temporariamente suspensa até ' || 
      to_char((NEW.metadata->>'suspended_until')::timestamp with time zone, 'DD/MM/YYYY HH24:MI') || 
      '. Motivo: ' || NEW.reason,
      'error'
    );

  -- If ACTION is REACTIVATION
  ELSIF NEW.action_type = 'reactivation' THEN
    -- Update profile status
    UPDATE public.profiles
    SET 
      account_status = 'active',
      suspended_until = null,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    -- Unfreeze businesses frozen by suspension
    UPDATE public.businesses
    SET 
      is_frozen = false,
      frozen_at = null,
      frozen_reason = null
    WHERE owner_id = NEW.target_user_id AND frozen_reason LIKE 'Proprietário suspenso%';

    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Conta Reativada',
      'Sua conta foi reativada por um administrador. Bem-vindo de volta!',
      'success'
    );

  -- If ACTION is FREEZE (Individual business)
  ELSIF NEW.action_type = 'freeze' THEN
    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = NEW.reason
    WHERE id = (NEW.metadata->>'business_id')::uuid;

  -- If ACTION is UNFREEZE (Individual business)
  ELSIF NEW.action_type = 'unfreeze' THEN
    UPDATE public.businesses
    SET 
      is_frozen = false,
      frozen_at = null,
      frozen_reason = null
    WHERE id = (NEW.metadata->>'business_id')::uuid;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add comprehensive Admin RLS policies for all tables

-- Businesses: Admin Delete
DROP POLICY IF EXISTS "Admins can delete all businesses" ON public.businesses;
CREATE POLICY "Admins can delete all businesses"
  ON public.businesses FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Business Pages: Admin Manage
DROP POLICY IF EXISTS "Admins can manage all business pages" ON public.business_pages;
CREATE POLICY "Admins can manage all business pages"
  ON public.business_pages FOR ALL
  USING (public.is_admin(auth.uid()));

-- Page Links: Admin Manage
DROP POLICY IF EXISTS "Admins can manage all page links" ON public.page_links;
CREATE POLICY "Admins can manage all page links"
  ON public.page_links FOR ALL
  USING (public.is_admin(auth.uid()));

-- Review Links: Admin Manage
DROP POLICY IF EXISTS "Admins can manage all review links" ON public.review_links;
CREATE POLICY "Admins can manage all review links"
  ON public.review_links FOR ALL
  USING (public.is_admin(auth.uid()));

-- QR Codes: Admin Manage
DROP POLICY IF EXISTS "Admins can manage all qr codes" ON public.qr_codes;
CREATE POLICY "Admins can manage all qr codes"
  ON public.qr_codes FOR ALL
  USING (public.is_admin(auth.uid()));

-- Reviews: Admin Delete (Moderation)
DROP POLICY IF EXISTS "Admins can delete all reviews" ON public.reviews;
CREATE POLICY "Admins can delete all reviews"
  ON public.reviews FOR DELETE
  USING (public.is_admin(auth.uid()));
