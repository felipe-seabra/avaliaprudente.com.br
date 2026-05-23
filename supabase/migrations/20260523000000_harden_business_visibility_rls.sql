-- Moderation Integrity Hardening: Business Visibility

-- 1. Optimize performance for public listings and moderation queries
CREATE INDEX IF NOT EXISTS idx_businesses_is_frozen ON public.businesses(is_frozen);

-- 2. Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;

-- 3. Create a strict public policy that filters out frozen businesses
CREATE POLICY "Anyone can view businesses"
  ON public.businesses FOR SELECT
  USING (
    (is_frozen = false) OR 
    (owner_id = auth.uid()) OR 
    public.is_admin(auth.uid())
  );
