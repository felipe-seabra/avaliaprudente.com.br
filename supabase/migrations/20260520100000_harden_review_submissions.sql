-- Hardening Review Submissions
-- This migration removes public insert access to the reviews table, 
-- forcing all submissions to go through our trusted server-side API.

-- 1. Remove the public insert policy
DROP POLICY IF EXISTS "Anyone can insert a review" ON public.reviews;

-- 2. Create a new policy that only allows service_role (implicitly allowed if no other policy exists for a role)
-- but let's be explicit about who can still interact with reviews.
-- Note: admins already have "Admins can view all reviews" etc.

-- We don't need a specific policy for service_role as it bypasses RLS, 
-- but we ensure NO policy exists for 'anon' or 'authenticated' for INSERT.

-- 3. Ensure SELECT access remains public for legitimate viewing
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = reviews.business_id
      AND (
        (businesses.is_frozen = false) OR 
        (businesses.owner_id = auth.uid()) OR 
        public.is_admin(auth.uid())
      )
    )
  );

-- 4. Audit: Ensure analytics also follows similar hardening soon
-- For now, we focus on reviews as requested.
