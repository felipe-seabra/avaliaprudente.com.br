-- Audit Logs Foundation

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- Insert: Service Role can insert anything. Authenticated users can insert their own actions.
CREATE POLICY "Users can insert their own audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());

-- Select: Only super_admins can view audit logs.
CREATE POLICY "Only super_admin can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Prevent Updates and Deletes explicitly
CREATE POLICY "Prevent updates on audit logs"
    ON public.audit_logs
    FOR UPDATE
    TO authenticated
    USING (false);

CREATE POLICY "Prevent deletes on audit logs"
    ON public.audit_logs
    FOR DELETE
    TO authenticated
    USING (false);

-- Index for querying
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
