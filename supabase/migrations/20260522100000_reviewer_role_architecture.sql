-- Reviewer Role Architecture
-- This migration introduces the 'reviewer' role and makes it the default for new users.
-- It also safely migrates existing customers without businesses to the reviewer role.

-- 1. Update the user_role enum type
-- Note: We cannot easily update Enums in PostgreSQL within a transaction if they are used by tables.
-- However, we can update the check constraint on the profiles table.
DO $$
BEGIN
    -- We keep the enum type as a reference if it exists, but we mainly rely on the check constraint.
    -- If we want to update the enum type:
    -- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'reviewer';
    -- But since some environments might not support ADD VALUE inside a DO block or transaction:
    NULL;
END
$$;

-- 2. Update profiles table constraints and defaults
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('reviewer', 'customer', 'admin', 'super_admin'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'reviewer';

-- 3. Safely migrate existing customers without businesses to the reviewer role
-- We use NOT EXISTS for better robustness as requested.
UPDATE public.profiles p
SET role = 'reviewer'
WHERE role = 'customer'
  AND NOT EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.owner_id = p.id
  );

-- 4. Update the handle_new_user function if it was hardcoded (it wasn't, but let's be sure)
-- The profiles.role column now has a default of 'reviewer', so new inserts will use it automatically.

-- 5. Document the support
COMMENT ON COLUMN public.profiles.role IS 'User access role. Supported: reviewer, customer, admin, super_admin.';
