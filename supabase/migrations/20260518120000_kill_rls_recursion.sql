-- Kill RLS Recursion and Standardize Admin Access

-- 1. Robust is_admin function (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Profiles Table - Clean up and Standardize
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- 3. Businesses Table - Clean up and Standardize
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can manage their businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can view their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can insert their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can delete their own businesses" ON public.businesses;

CREATE POLICY "Anyone can view businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their businesses"
  ON public.businesses FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all businesses"
  ON public.businesses FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all businesses"
  ON public.businesses FOR UPDATE
  USING (is_admin(auth.uid()));

-- 4. Verification Requests Table - Clean up and Standardize
DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can insert their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.verification_requests;

CREATE POLICY "Users can view their own requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests"
  ON public.verification_requests FOR ALL
  USING (is_admin(auth.uid()));

-- 5. Notifications Table - Clean up and Standardize
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications for anyone" ON public.notifications;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications for anyone"
  ON public.notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));
