-- Fix: Allow users to update their own profiles (for terms acceptance and profile management)
-- and add a protection trigger to prevent unauthorized changes to sensitive fields.

-- 1. Create a function to protect sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Master bypass for admins: they can update anything
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- For regular users, ensure they aren't trying to change restricted fields
  IF (NEW.role IS DISTINCT FROM OLD.role) OR
     (NEW.is_blocked IS DISTINCT FROM OLD.is_blocked) OR
     (NEW.is_deleted IS DISTINCT FROM OLD.is_deleted) OR
     (NEW.account_status IS DISTINCT FROM OLD.account_status) OR
     (NEW.suspended_until IS DISTINCT FROM OLD.suspended_until) THEN
     RAISE EXCEPTION 'Not authorized to modify protected profile fields (role, status, etc.)';
  END IF;
  
  -- Ensure users can only update their own profile
  -- (Though RLS policy already handles this, this is double protection)
  IF (auth.uid() IS DISTINCT FROM OLD.id) THEN
     RAISE EXCEPTION 'Not authorized to modify other users profiles';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create the trigger on public.profiles
DROP TRIGGER IF EXISTS ensure_profile_protection ON public.profiles;
CREATE TRIGGER ensure_profile_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_profile_fields();

-- 3. Restore the RLS UPDATE policy for users
-- This policy was previously dropped and never restored in a non-recursive way.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Re-verify Select Policies to ensure no recursion
-- (Already handled by 20260518170000_robust_rls_stabilization.sql but good to keep in mind)
