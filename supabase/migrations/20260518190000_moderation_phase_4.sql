-- Moderation System Phase 4: Safe Account Deactivation (Soft Delete)

-- 1. Update profiles table with soft delete fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- 2. Update moderation_actions table constraints to include 'deactivation'
ALTER TABLE public.moderation_actions DROP CONSTRAINT IF EXISTS moderation_actions_action_type_check;
ALTER TABLE public.moderation_actions 
  ADD CONSTRAINT moderation_actions_action_type_check 
  CHECK (action_type IN ('warning', 'suspension', 'reactivation', 'freeze', 'unfreeze', 'ban', 'deactivation'));

-- 3. Update the moderation escalation function to handle 'deactivation'
CREATE OR REPLACE FUNCTION public.process_moderation_escalation()
RETURNS trigger AS $$
BEGIN
  -- If ACTION is DEACTIVATION (Phase 4)
  IF NEW.action_type = 'deactivation' THEN
    -- Soft delete the profile
    UPDATE public.profiles
    SET 
      is_deleted = true,
      deleted_at = now(),
      updated_at = now()
    WHERE id = NEW.target_user_id;

    -- Freeze all businesses owned by this user
    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = 'Conta desativada pelo administrador: ' || NEW.reason
    WHERE owner_id = NEW.target_user_id AND is_frozen = false;

    -- Create notification (Though user won't see it if they are logged out/redirected)
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Sua conta foi desativada',
      'Sua conta foi desativada por um administrador. Motivo: ' || NEW.reason,
      'error'
    );

  -- If ACTION is BAN (Phase 3)
  ELSIF NEW.action_type = 'ban' THEN
    UPDATE public.profiles
    SET 
      account_status = 'banned',
      banned_at = now(),
      banned_reason = NEW.reason,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = 'Proprietário banido permanentemente: ' || NEW.reason
    WHERE owner_id = NEW.target_user_id AND is_frozen = false;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Sua conta foi banida permanentemente',
      'Sua conta foi permanentemente banida da plataforma. Motivo: ' || NEW.reason,
      'error'
    );

  -- If ACTION is SUSPENSION (Phase 2)
  ELSIF NEW.action_type = 'suspension' THEN
    UPDATE public.profiles
    SET 
      account_status = 'suspended',
      suspended_until = (NEW.metadata->>'suspended_until')::timestamp with time zone,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = 'Proprietário suspenso: ' || NEW.reason
    WHERE owner_id = NEW.target_user_id AND is_frozen = false;

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
    UPDATE public.profiles
    SET 
      account_status = 'active',
      suspended_until = null,
      banned_at = null,
      banned_reason = null,
      is_deleted = false,
      deleted_at = null,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    UPDATE public.businesses
    SET 
      is_frozen = false,
      frozen_at = null,
      frozen_reason = null
    WHERE owner_id = NEW.target_user_id AND (
      frozen_reason LIKE 'Proprietário suspenso%' OR 
      frozen_reason LIKE 'Proprietário banido%' OR
      frozen_reason LIKE 'Conta desativada%'
    );

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Conta Reativada/Reativada',
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

-- 4. Update the is_suspended helper to include deleted users
CREATE OR REPLACE FUNCTION public.is_suspended(u_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Master bypass for admins
  IF public.is_admin(u_id) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = u_id
    AND (
      (account_status = 'suspended' AND (suspended_until IS NULL OR suspended_until > now()))
      OR
      (account_status = 'banned')
      OR
      (is_deleted = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
