-- Fix conflicting triggers blocking reviewer -> customer self-upgrade
-- Root cause: ensure_profile_protection trigger was blocking any role change before tr_enforce_role_management could evaluate it.

-- 1. Update protect_profile_fields to delegate role governance to enforce_role_management
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Master bypass for admins: they can update anything
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- For regular users, ensure they aren't trying to change restricted fields
  -- We REMOVED NEW.role check from here because it is handled by tr_enforce_role_management
  IF (NEW.is_blocked IS DISTINCT FROM OLD.is_blocked) OR
     (NEW.is_deleted IS DISTINCT FROM OLD.is_deleted) OR
     (NEW.account_status IS DISTINCT FROM OLD.account_status) OR
     (NEW.suspended_until IS DISTINCT FROM OLD.suspended_until) THEN
     RAISE EXCEPTION 'Not authorized to modify protected profile fields (status, etc.)';
  END IF;
  
  -- Ensure users can only update their own profile
  IF (auth.uid() IS DISTINCT FROM OLD.id) THEN
     RAISE EXCEPTION 'Not authorized to modify other users profiles';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- No need to drop/recreate trigger, just updating the function is enough as it's used by the trigger.
