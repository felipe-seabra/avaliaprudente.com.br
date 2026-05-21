-- Database Synchronization: Super Admin Role Support
-- This migration updates the role check constraint to include the new super_admin role.
-- We keep the column as TEXT to avoid breaking RLS policies that depend on the column type.

-- 1. Create the user_role enum type for reference and validation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin');
    END IF;
END
$$;

-- 2. Update profiles table check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('customer', 'admin', 'super_admin'));

-- 3. Document the support
COMMENT ON COLUMN public.profiles.role IS 'User access role. Supported: customer, admin, super_admin.';
COMMENT ON TYPE public.user_role IS 'Reference enum for access hierarchy levels.';
