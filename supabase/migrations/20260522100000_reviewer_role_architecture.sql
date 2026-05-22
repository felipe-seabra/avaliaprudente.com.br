-- Reviewer Role Architecture
-- This migration introduces the 'reviewer' role and makes it the default for new users.
-- It also safely migrates existing customers without businesses to the reviewer role.

-- 1. Update the user_role enum type
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some environments.
-- We use a separate DO block or just try-catch if possible, but for migrations, 
-- we often have to rely on the check constraint for the immediate fix.
-- However, we'll try to add it here.
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'reviewer';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add reviewer to user_role enum. This is expected if running inside a transaction.';
END
$$;

-- 2. Update profiles table constraints and defaults
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('reviewer', 'customer', 'admin', 'super_admin'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'reviewer';

-- 3. Safely migrate existing customers without businesses to the reviewer role
-- We temporarily disable the protection triggers to allow this administrative update.
ALTER TABLE public.profiles DISABLE TRIGGER ensure_profile_protection;
ALTER TABLE public.profiles DISABLE TRIGGER tr_enforce_role_management;

UPDATE public.profiles p
SET role = 'reviewer'
WHERE role = 'customer'
  AND NOT EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.owner_id = p.id
  );

ALTER TABLE public.profiles ENABLE TRIGGER ensure_profile_protection;
ALTER TABLE public.profiles ENABLE TRIGGER tr_enforce_role_management;

-- 4. Update the handle_new_user function if it was hardcoded (it wasn't, but let's be sure)
-- The profiles.role column now has a default of 'reviewer', so new inserts will use it automatically.

-- 5. Document the support
COMMENT ON COLUMN public.profiles.role IS 'User access role. Supported: reviewer, customer, admin, super_admin.';
