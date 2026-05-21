-- Super Admin Governance
-- Formalizes a privileged "Super Admin" role with exclusive authority over administrative access management.

-- 1. Redefine is_admin to include super_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Security Definer bypasses RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. New is_super_admin function for granular governance
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Security Definer bypasses RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Restrict role management to super_admin only
-- This ensures that regular admins cannot promote themselves or others, 
-- and cannot revoke other admins if they are not super admins.
CREATE OR REPLACE FUNCTION public.enforce_role_management()
RETURNS trigger AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Check if the user performing the update is a super_admin
    -- Note: auth.uid() is the user making the request
    IF NOT public.is_super_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Apenas Super Administradores podem gerenciar permissões de acesso.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_enforce_role_management ON public.profiles;
CREATE TRIGGER tr_enforce_role_management
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_management();

-- 4. Governance: Ensure Super Admins bypass moderation (already handled via updated is_admin)
-- existing functions is_suspended and is_business_frozen use public.is_admin(u_id)

-- 5. Documentation of the hierarchy in the database
COMMENT ON FUNCTION public.is_super_admin IS 'Checks if a user has the super_admin role for platform governance.';
COMMENT ON TRIGGER tr_enforce_role_management ON public.profiles IS 'Ensures only super admins can change the role column in profiles.';
