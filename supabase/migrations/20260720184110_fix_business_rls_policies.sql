-- Fix businesses RLS SELECT policy to allow public users to query frozen businesses
-- so that the application can render the "Empresa Indisponível" (Business Suspended) page
-- instead of returning a generic 404 Not Found error.

DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;

CREATE POLICY "Anyone can view businesses"
  ON public.businesses FOR SELECT
  USING (true);
