-- Migration: 20260527100000_restore_notifications_permissions.sql
-- Foco: Restaurar privilégios mínimos necessários para notificações após o endurecimento global.

BEGIN;

-- 1. CONCEDER ACESSO MÍNIMO À TABELA DE NOTIFICAÇÕES
-- SELECT: Necessário para carregar a lista de notificações do usuário.
-- UPDATE: Necessário para que o usuário marque notificações como lidas (is_read = true).
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- 2. GARANTIR QUE RLS ESTEJA ATIVO (Segurança por isolamento de linha)
-- Nota: As políticas de RLS existentes já garantem que um usuário só pode 
-- ver e atualizar suas próprias notificações (user_id = auth.uid()).
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. RE-AFIRMAR AS POLÍTICAS DE RLS PARA CLAREZA (Opcional, mas recomendado após revogação global)
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can create notifications for anyone" ON public.notifications;
CREATE POLICY "Admins can create notifications for anyone"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

COMMIT;
