-- Migration: 20260527110000_fix_dashboard_and_notifications_permissions.sql
-- Foco: Restaurar permissões mínimas para audit_logs e completar permissões de notificações.

BEGIN;

-- 1. RESTAURAR ACESSO AO DASHBOARD DE SEGURANÇA (audit_logs)
-- Somente SELECT é necessário para o Dashboard. 
-- O RLS já restringe isso para super_admins apenas.
GRANT SELECT ON public.audit_logs TO authenticated;

-- 2. COMPLETAR PERMISSÕES DE NOTIFICAÇÕES
-- Além de SELECT e UPDATE (já concedidos anteriormente), precisamos de DELETE para descartar notificações
-- e INSERT para que administradores possam gerar novas notificações via aplicação.
GRANT INSERT, DELETE ON public.notifications TO authenticated;

-- 3. REFORÇAR RLS (Garantindo que mesmo com os GRANTS, o isolamento permanece)
-- audit_logs: Only super_admin can view (Política já existe, apenas garantindo consistência)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- notifications: Users manage own, Admins insert for anyone (Políticas já existem)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. VALIDAR POLÍTICAS DE NOTIFICAÇÕES (Garantir que DELETE também está coberto se usarem FOR ALL)
-- A política "Users can manage their own notifications" já usa FOR ALL, cobrindo DELETE.
-- No entanto, vamos garantir que ela está correta e presente.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can manage their own notifications'
    ) THEN
        CREATE POLICY "Users can manage their own notifications"
          ON public.notifications FOR ALL
          TO authenticated
          USING (user_id = auth.uid())
          WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

COMMIT;
