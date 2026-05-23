-- Centralized Moderation Views
-- These views provide a canonical way to access "publicly visible" data,
-- ensuring that frozen businesses and their related content are automatically excluded.

-- 1. Active Businesses (Excludes frozen)
CREATE OR REPLACE VIEW public.active_businesses AS
SELECT * 
FROM public.businesses 
WHERE is_frozen = false;

-- 2. Active Business Pages (Excludes pages of frozen businesses AND unpublished pages)
CREATE OR REPLACE VIEW public.active_business_pages AS
SELECT bp.* 
FROM public.business_pages bp
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true;

-- 3. Active Reviews (Excludes reviews of frozen businesses)
-- Note: Reviews themselves might have their own moderation status in the future,
-- but for now they only depend on the business state.
CREATE OR REPLACE VIEW public.active_reviews AS
SELECT r.* 
FROM public.reviews r
JOIN public.businesses b ON r.business_id = b.id
WHERE b.is_frozen = false;

-- 4. Active Page Links (Excludes links of frozen businesses or unpublished pages)
CREATE OR REPLACE VIEW public.active_page_links AS
SELECT pl.* 
FROM public.page_links pl
JOIN public.business_pages bp ON pl.page_id = bp.id
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true AND pl.is_active = true;

-- Grant access to anonymous and authenticated users
GRANT SELECT ON public.active_businesses TO anon, authenticated;
GRANT SELECT ON public.active_business_pages TO anon, authenticated;
GRANT SELECT ON public.active_reviews TO anon, authenticated;
GRANT SELECT ON public.active_page_links TO anon, authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.active_businesses IS 'Canonical view for publicly visible businesses (excludes frozen).';
COMMENT ON VIEW public.active_business_pages IS 'Canonical view for publicly visible business pages (excludes frozen/unpublished).';
COMMENT ON VIEW public.active_reviews IS 'Canonical view for publicly visible reviews (excludes reviews of frozen businesses).';
COMMENT ON VIEW public.active_page_links IS 'Canonical view for publicly visible links (excludes frozen/inactive).';
