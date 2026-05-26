-- Migration: 20260527000000_final_security_hardening.sql
-- Foco: Revogação completa de privilégios excessivos e endurecimento final das views.

BEGIN;

-- 1. REVOGAÇÃO GLOBAL DE PRIVILÉGIOS NO ESQUEMA PUBLIC
-- Isso remove qualquer grant padrão ou residual que possa ser explorado.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON SCHEMA public FROM anon, authenticated;

-- 2. RECONCESSÃO DE ACESSO MÍNIMO AO ESQUEMA
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 3. ENDURECIMENTO DAS VIEWS (Redefinição para garantir segurança e sanitização)

-- active_reviews: removendo auth_provider para evitar fingerprinting/info leakage
DROP VIEW IF EXISTS public.active_reviews;
CREATE VIEW public.active_reviews 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.business_id,
    r.rating,
    r.feedback,
    r.display_name,
    r.created_at,
    r.updated_at
FROM public.reviews r
JOIN public.businesses b ON r.business_id = b.id
WHERE b.is_frozen = false;

-- active_businesses: garantindo que colunas internas permanecem ocultas
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

-- active_business_pages: mantendo foco em conteúdo público
DROP VIEW IF EXISTS public.active_business_pages;
CREATE VIEW public.active_business_pages 
WITH (security_invoker = true) AS
SELECT 
    bp.id, 
    bp.business_id, 
    bp.description, 
    bp.theme_config, 
    bp.is_published, 
    bp.created_at, 
    bp.updated_at
FROM public.business_pages bp
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true;

-- active_page_links: mantendo foco em links ativos
DROP VIEW IF EXISTS public.active_page_links;
CREATE VIEW public.active_page_links 
WITH (security_invoker = true) AS
SELECT 
    pl.id, 
    pl.page_id, 
    pl.type, 
    pl.title, 
    pl.url, 
    pl.icon_name, 
    pl.sort_order, 
    pl.is_active, 
    pl.created_at, 
    pl.updated_at
FROM public.page_links pl
JOIN public.business_pages bp ON pl.page_id = bp.id
JOIN public.businesses b ON bp.business_id = b.id
WHERE b.is_frozen = false AND bp.is_published = true AND pl.is_active = true;

-- reviewer_stats: agregando dados sem expor detalhes individuais
DROP VIEW IF EXISTS public.reviewer_stats;
CREATE VIEW public.reviewer_stats 
WITH (security_invoker = true) AS
SELECT 
    r.user_id, 
    count(r.id) AS approved_reviews_count
FROM public.reviews r
JOIN public.businesses b ON r.business_id = b.id
WHERE r.user_id IS NOT NULL AND b.is_frozen = false
GROUP BY r.user_id;

-- 4. CONCESSÃO DE PRIVILÉGIOS DE LEITURA (SELECT) NAS VIEWS
-- Revogando primeiro para garantir que nenhum privilégio padrão permaneça
REVOKE ALL ON public.active_reviews FROM anon, authenticated;
REVOKE ALL ON public.active_businesses FROM anon, authenticated;
REVOKE ALL ON public.active_business_pages FROM anon, authenticated;
REVOKE ALL ON public.active_page_links FROM anon, authenticated;
REVOKE ALL ON public.reviewer_stats FROM anon, authenticated;

GRANT SELECT ON public.active_reviews TO anon, authenticated;
GRANT SELECT ON public.active_businesses TO anon, authenticated;
GRANT SELECT ON public.active_business_pages TO anon, authenticated;
GRANT SELECT ON public.active_page_links TO anon, authenticated;
GRANT SELECT ON public.reviewer_stats TO anon, authenticated;

-- 5. PRIVILÉGIOS EM TABELAS BASE (Necessários para SECURITY INVOKER e RLS)
-- Somente SELECT onde necessário. RLS nas tabelas garantirá o isolamento.
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT SELECT ON public.business_pages TO anon, authenticated;
GRANT SELECT ON public.page_links TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.review_responses TO anon, authenticated;

-- 6. PRIVILÉGIOS DE ESCRITA CONTROLADOS
-- reviews: anon e authenticated podem inserir reviews (protegido por RLS)
GRANT INSERT ON public.reviews TO anon, authenticated;
-- analytics_events: ingestão de eventos
GRANT INSERT ON public.analytics_events TO anon, authenticated;
-- profiles: usuários podem atualizar seus próprios perfis
GRANT UPDATE ON public.profiles TO authenticated;

COMMIT;
