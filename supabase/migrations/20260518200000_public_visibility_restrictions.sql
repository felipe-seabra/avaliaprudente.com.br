-- Public Visibility Restrictions for Frozen Businesses

-- 1. Business Pages: Hide pages for frozen businesses from public
DROP POLICY IF EXISTS "Public can view published business pages" ON public.business_pages;
DROP POLICY IF EXISTS "Public can view business pages" ON public.business_pages;

CREATE POLICY "Public can view business pages"
  ON public.business_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_pages.business_id
      AND (
        (businesses.is_frozen = false) OR 
        (businesses.owner_id = auth.uid()) OR 
        public.is_admin(auth.uid())
      )
    )
  );

-- 2. Page Links: Hide links for frozen businesses from public
DROP POLICY IF EXISTS "Public can view active page links" ON public.page_links;
DROP POLICY IF EXISTS "Public can view page links" ON public.page_links;

CREATE POLICY "Public can view page links"
  ON public.page_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_pages
      JOIN public.businesses ON businesses.id = business_pages.business_id
      WHERE business_pages.id = page_links.page_id
      AND (
        (businesses.is_frozen = false) OR 
        (businesses.owner_id = auth.uid()) OR 
        public.is_admin(auth.uid())
      )
    )
  );

-- 3. Reviews: Hide reviews for frozen businesses from public
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
