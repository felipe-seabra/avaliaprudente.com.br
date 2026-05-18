-- Fix Verification Flow and Admin RLS Permissions

-- 1. Clean up business verification status constraints
DO $$ 
BEGIN
    -- Drop all potential name variations of the constraint to be safe
    ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_verification_status_check;
    ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_verification_status_check1;
END $$;

-- 2. Ensure only the correct constraint exists for businesses
ALTER TABLE public.businesses 
    ADD CONSTRAINT businesses_verification_status_check 
    CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- 3. Update sync_business_verification trigger function to use 'approved'
CREATE OR REPLACE FUNCTION public.sync_business_verification()
RETURNS trigger AS $$
BEGIN
  -- If status changed to approved (was verified in old version)
  IF new.verification_status = 'approved' AND (old.verification_status IS NULL OR old.verification_status != 'approved') THEN
    new.is_verified := true;
    IF new.verified_at IS NULL THEN
      new.verified_at := now();
    END IF;
    IF new.verified_by IS NULL THEN
      new.verified_by := auth.uid();
    END IF;
  
  -- If status changed from approved to something else
  ELSIF new.verification_status != 'approved' AND (old.verification_status = 'approved') THEN
    new.is_verified := false;
    new.verified_at := null;
    new.verified_by := null;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update handle_business_verification_initial_state to use 'approved'
CREATE OR REPLACE FUNCTION public.handle_business_verification_initial_state()
RETURNS trigger AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF (TG_OP = 'INSERT') THEN
    IF (is_admin_user is true) THEN
      new.verification_status := 'approved';
      new.is_verified := true;
      new.verified_at := now();
      new.verified_by := auth.uid();
    ELSE
      new.verification_status := 'pending';
      new.is_verified := false;
      new.verified_at := null;
      new.verified_by := null;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update handle_admin_business_verification to use 'approved'
CREATE OR REPLACE FUNCTION public.handle_admin_business_verification()
RETURNS trigger AS $$
DECLARE
  creator_role text;
BEGIN
  SELECT role INTO creator_role 
  FROM public.profiles 
  WHERE id = new.owner_id;

  IF creator_role = 'admin' THEN
    new.is_verified := true;
    new.verification_status := 'approved';
    IF new.verified_at IS NULL THEN
        new.verified_at := now();
    END IF;
    IF new.verified_by IS NULL THEN
        new.verified_by := new.owner_id;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add Admin RLS Update Policy for Businesses
DROP POLICY IF EXISTS "Admins can update all businesses" ON public.businesses;
CREATE POLICY "Admins can update all businesses"
    ON public.businesses FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- 7. Add Admin RLS Update Policy for Profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- 8. Fix verification_requests table constraints
DO $$ 
BEGIN
    ALTER TABLE public.verification_requests DROP CONSTRAINT IF EXISTS verification_requests_status_check;
END $$;

ALTER TABLE public.verification_requests 
    ADD CONSTRAINT verification_requests_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
