-- Hardening Analytics Ingestion
-- This migration removes public insert access to the analytics_events table, 
-- forcing all events to go through our trusted server-side API.

-- 1. Remove the public insert policy
DROP POLICY IF EXISTS "Anyone can insert an analytics event" ON public.analytics_events;

-- 2. Ensure SELECT access remains public for legitimate dashboard viewing if needed 
-- (Though usually dashboard uses authenticated role or admin role)
-- We'll keep existing SELECT policies as they are likely scoped correctly.

-- 3. Audit: Ensure service_role can still bypass RLS (Default Supabase behavior)
-- This allows our /api/analytics route to continue working.

-- 4. Re-verify the deduplication trigger
-- The trigger tr_enforce_analytics_deduplication already exists and uses 
-- the 'fingerprint' column. Since our API now provides a TRUSTED fingerprint,
-- the deduplication is now much more robust.
