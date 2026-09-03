-- Migration: 20260903100000_protect_business_privileged_fields.sql
-- Security Remediation: SEC-04 — Protect privileged fields in public.businesses
--
-- Description:
-- Previously, column-level security was not enforced at the database level for public.businesses.
-- The RLS policy "Owners can manage their businesses" allowed business owners (auth.uid() = owner_id)
-- to update their own business records across all columns. While frontend UI components hid verification
-- and freeze controls from non-admin users, malicious users could directly invoke Supabase/PostgREST APIs
-- to modify privileged columns such as is_verified, verification_status, verified_at, verified_by,
-- is_frozen, and plan_type.
--
-- This migration creates a PostgreSQL BEFORE UPDATE trigger and trigger function that blocks any non-admin
-- user from altering these protected fields, while allowing legitimate administrators/super administrators
-- and internal service_role/system operations to perform updates as needed.

CREATE OR REPLACE FUNCTION public.enforce_business_protected_fields()
RETURNS trigger AS $$
BEGIN
  -- 1. Allow service_role or internal system operations without an authenticated user context
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- 2. Allow platform administrators and super administrators full control
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- 3. Reject any attempt by non-admin users to modify protected privileged fields
  IF (
    OLD.is_verified IS DISTINCT FROM NEW.is_verified OR
    OLD.verification_status IS DISTINCT FROM NEW.verification_status OR
    OLD.verified_at IS DISTINCT FROM NEW.verified_at OR
    OLD.verified_by IS DISTINCT FROM NEW.verified_by OR
    OLD.is_frozen IS DISTINCT FROM NEW.is_frozen OR
    OLD.plan_type IS DISTINCT FROM NEW.plan_type
  ) THEN
    RAISE EXCEPTION 'Permissão negada: apenas administradores podem alterar campos protegidos da empresa (is_verified, verification_status, verified_at, verified_by, is_frozen, plan_type).'
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  -- 4. Allow non-privileged modifications (e.g., name, slug, logo_url, address)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure execution permission for authenticated users executing updates
GRANT EXECUTE ON FUNCTION public.enforce_business_protected_fields() TO authenticated, service_role;

-- Drop trigger if exists for idempotency
DROP TRIGGER IF EXISTS enforce_business_protected_fields_trigger ON public.businesses;
DROP TRIGGER IF EXISTS tr_protect_business_privileged_fields ON public.businesses;

-- Create BEFORE UPDATE trigger on public.businesses
CREATE TRIGGER enforce_business_protected_fields_trigger
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_protected_fields();
