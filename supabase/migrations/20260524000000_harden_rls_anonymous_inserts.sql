-- Remediation Phase 1: RLS Hardening and Anonymous Insert Protection
-- This migration fixes the CRITICAL vulnerability where unauthenticated users 
-- could bypass Next.js and insert data directly into the database.

-- 1. Revoke direct INSERT permissions for anonymous and authenticated roles
-- This forces all writes to go through our trusted server-side API (Next.js API Routes)
-- which use the service_role key to bypass RLS safely after validation.

-- We also revoke from 'authenticated' to ensure even logged-in users cannot 
-- manipulate the 'user_id' or 'is_internal' fields by bypassing the API.
REVOKE INSERT ON TABLE public.reviews FROM anon;
REVOKE INSERT ON TABLE public.reviews FROM authenticated;

REVOKE INSERT ON TABLE public.analytics_events FROM anon;
REVOKE INSERT ON TABLE public.analytics_events FROM authenticated;

-- 2. Explicitly Grant UPDATE and DELETE to authenticated users only for reviews
-- (Needed for the /api/reviews/[id] endpoints which use the user's session)
GRANT UPDATE, DELETE ON TABLE public.reviews TO authenticated;

-- 3. Revoke overly permissive SELECT on analytics for anonymous users
-- Anonymous users should never see raw analytics data.
REVOKE SELECT ON TABLE public.analytics_events FROM anon;

-- 4. Ensure all public INSERT policies are dropped
-- This is a belt-and-suspenders approach to ensure no policies were missed.
DROP POLICY IF EXISTS "Anyone can insert a review" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert an analytics event" ON public.analytics_events;

-- 5. Ensure RLS is enabled and active
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 6. Document the new trust boundary
COMMENT ON TABLE public.reviews IS 'Protected reviews table. Inserts MUST go through /api/reviews using service_role. Updates/Deletes use RLS.';
COMMENT ON TABLE public.analytics_events IS 'Protected analytics table. Inserts MUST go through /api/analytics using service_role.';
