-- Robust RLS Fix: Eliminate all recursion and stabilize admin access

-- 1. Redefine is_admin to be absolutely safe
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- We query auth.users metadata if possible, or profiles with NO RLS check
  -- Since this is SECURITY DEFINER, it bypasses RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Profiles Table: Simple non-recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Anyone can see their own profile (Non-recursive)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can see all profiles (Uses the SECURITY DEFINER function)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 3. Businesses Table: Stable policies
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can manage their businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can delete all businesses" ON public.businesses;

CREATE POLICY "Anyone can view businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their businesses"
  ON public.businesses FOR ALL
  USING (
    auth.uid() = owner_id AND 
    NOT public.is_suspended(auth.uid())
  );

CREATE POLICY "Admins can view all businesses"
  ON public.businesses FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all businesses"
  ON public.businesses FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all businesses"
  ON public.businesses FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 4. Ensure public.is_suspended also uses the robust is_admin
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
    AND account_status = 'suspended'
    AND (suspended_until IS NULL OR suspended_until > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Ensure public.is_business_frozen also respects admins
CREATE OR REPLACE FUNCTION public.is_business_frozen(b_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Admins can always see/manage frozen businesses
  IF public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = b_id
    AND is_frozen = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
