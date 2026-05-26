-- Migration: 20260526100158_harden_public_views.sql
-- Foco: Eliminar vazamento de PII e garantir aplicação de RLS via security_invoker.

BEGIN;

-- 1. Limpeza de Permissões Excessivas (Sanity Check)
REVOKE ALL ON TABLE public.active_reviews FROM anon, authenticated;
REVOKE ALL ON TABLE public.active_businesses FROM anon, authenticated;
REVOKE ALL ON TABLE public.active_business_pages FROM anon, authenticated;
REVOKE ALL ON TABLE public.active_page_links FROM anon, authenticated;
REVOKE ALL ON TABLE public.reviewer_stats FROM anon, authenticated;

-- 2. Redefinição de active_reviews (Removendo PII e Fingerprints)
DROP VIEW IF EXISTS public.active_reviews;
CREATE VIEW public.active_reviews 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.business_id,
    r.rating,
    r.feedback,
    r.display_name,
    r.auth_provider,
    r.created_at,
    r.updated_at
FROM public.reviews r
JOIN public.businesses b ON r.business_id = b.id
WHERE b.is_frozen = false;

-- 3. Redefinição de active_businesses (Ocultando owner_id e metadados internos)
DROP VIEW IF EXISTS public.active_businesses;
CREATE VIEW public.active_businesses 
WITH (security_invoker = true) AS
SELECT 
    id,
    name,
    slug,
    google_place_id,
    logo_url,
    address,
    is_verified,
    is_featured,
    plan_type,
    created_at,
    updated_at
FROM public.businesses
WHERE is_frozen = false;

-- 4. Atualização das demais views para usar SECURITY INVOKER
DROP VIEW IF EXISTS public.active_business_pages;
CREATE VIEW public.active_business_pages 
WITH (security_invoker = true) AS
SELECT bp.id, bp.business_id, bp.description, bp.theme_config, bp.is_published, bp.created_at, bp.updated_at
FROM public.business_pages bp
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true;

DROP VIEW IF EXISTS public.active_page_links;
CREATE VIEW public.active_page_links 
WITH (security_invoker = true) AS
SELECT pl.id, pl.page_id, pl.type, pl.title, pl.url, pl.icon_name, pl.sort_order, pl.is_active, pl.created_at, pl.updated_at
FROM public.page_links pl
JOIN public.business_pages bp ON pl.page_id = bp.id
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true AND pl.is_active = true;

DROP VIEW IF EXISTS public.reviewer_stats;
CREATE VIEW public.reviewer_stats 
WITH (security_invoker = true) AS
SELECT r.user_id, count(r.id) AS approved_reviews_count
FROM public.reviews r
JOIN public.businesses b ON r.business_id = b.id
WHERE r.user_id IS NOT NULL AND b.is_frozen = false
GROUP BY r.user_id;

-- 5. Concessão apenas de SELECT para anon e authenticated
GRANT SELECT ON public.active_reviews TO anon, authenticated;
GRANT SELECT ON public.active_businesses TO anon, authenticated;
GRANT SELECT ON public.active_business_pages TO anon, authenticated;
GRANT SELECT ON public.active_page_links TO anon, authenticated;
GRANT SELECT ON public.reviewer_stats TO anon, authenticated;

COMMIT;
