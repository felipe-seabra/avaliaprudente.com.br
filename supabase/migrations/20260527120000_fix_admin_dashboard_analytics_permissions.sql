-- Migration: 20260527120000_fix_admin_dashboard_analytics_permissions.sql
-- Foco: Restaurar permissões de leitura para analytics_events no dashboard administrativo.

BEGIN;

-- 1. RESTAURAR PERMISSÃO DE SELECT PARA USUÁRIOS AUTENTICADOS EM ANALYTICS_EVENTS
-- Essencial para o AdminRepository.getRecentActivity e AdminRepository.getPlatformStats.
-- O RLS (Admins can view all analytics) garantirá que apenas administradores vejam os dados globais.
-- Proprietários também mantêm acesso aos seus próprios dados via RLS (Owners can view their business analytics).
GRANT SELECT ON public.analytics_events TO authenticated;

-- 2. RESTAURAR PERMISSÕES PARA OUTRAS TABELAS DE ADMINISTRAÇÃO (Surgical)
-- Estas tabelas perderam acesso no endurecimento global e são críticas para o Dashboard Admin.
GRANT SELECT, INSERT ON public.moderation_actions TO authenticated;
GRANT SELECT, UPDATE ON public.verification_requests TO authenticated;
GRANT SELECT ON public.moderation_appeals TO authenticated;

-- 3. GARANTIR QUE RLS PERMANEÇA ATIVO (Segurança reforçada)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

COMMIT;
