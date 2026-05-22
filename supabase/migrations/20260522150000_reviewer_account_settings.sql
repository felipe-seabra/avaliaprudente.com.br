-- Migration: Reviewer Account Settings & Safe Deactivation
-- This migration adds notification preferences and allows users to manage their profile and deactivation.

-- 1. Add notification_preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "email_official_responses": true,
  "email_platform_updates": false
}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS 'Reviewer notification preferences for emails and platform updates.';

-- 2. Update the profile protection trigger to allow self-management of specific fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Master bypass for admins: they can update anything
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Ensure users can only update their own profile
  IF (auth.uid() IS DISTINCT FROM OLD.id) THEN
     RAISE EXCEPTION 'Not authorized to modify other users profiles';
  END IF;

  -- Restricted fields check
  -- ALLOW: setting is_deleted to true (self-deactivation)
  -- FORBID: anything else related to role, blocks, status, or REVERSING deactivation
  IF (NEW.role IS DISTINCT FROM OLD.role) OR
     (NEW.is_blocked IS DISTINCT FROM OLD.is_blocked) OR
     (NEW.account_status IS DISTINCT FROM OLD.account_status) OR
     (NEW.suspended_until IS DISTINCT FROM OLD.suspended_until) OR
     (NEW.is_deleted IS DISTINCT FROM OLD.is_deleted AND (OLD.is_deleted = true OR NEW.is_deleted = false)) THEN
     RAISE EXCEPTION 'Not authorized to modify protected profile fields (role, status, or unauthorized reactivation)';
  END IF;

  -- If setting is_deleted = true, ensure deleted_at is set automatically
  IF (NEW.is_deleted = true AND OLD.is_deleted = false) THEN
    NEW.deleted_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Trigger to sync full_name update to reviews.display_name
-- This ensures that "update reflected across reviews" as required.
CREATE OR REPLACE FUNCTION public.sync_profile_to_reviews()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.full_name IS DISTINCT FROM OLD.full_name) THEN
    UPDATE public.reviews
    SET display_name = NEW.full_name
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_sync_profile_to_reviews ON public.profiles;
CREATE TRIGGER tr_sync_profile_to_reviews
  AFTER UPDATE OF full_name ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_profile_to_reviews();
