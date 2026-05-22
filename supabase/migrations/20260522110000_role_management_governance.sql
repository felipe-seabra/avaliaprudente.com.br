-- Role Management Governance & Auditing
-- This migration updates the role management logic and introduces an audit table.

-- 1. Create role_change_logs table
CREATE TABLE IF NOT EXISTS public.role_change_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id uuid REFERENCES public.profiles(id) NOT NULL,
    target_id uuid REFERENCES public.profiles(id) NOT NULL,
    old_role public.user_role NOT NULL,
    new_role public.user_role NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.role_change_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/super_admins can view logs
CREATE POLICY "Admins can view role change logs"
    ON public.role_change_logs
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Only system/triggers can insert (handled via SECURITY DEFINER function if needed, 
-- but here we might just insert from the API or another trigger)
-- Actually, let's allow service role to insert, or we'll do it from the API.

-- 2. Update enforce_role_management function
CREATE OR REPLACE FUNCTION public.enforce_role_management()
RETURNS trigger AS $$
DECLARE
    current_user_id uuid := auth.uid();
    current_user_role public.user_role;
BEGIN
    -- If role is not being changed, just return
    IF OLD.role IS NOT DISTINCT FROM NEW.role THEN
        RETURN NEW;
    END IF;

    -- Get requester's role
    SELECT role INTO current_user_role FROM public.profiles WHERE id = current_user_id;

    -- super_admin can do everything
    IF current_user_role = 'super_admin' THEN
        -- Prevent self-demotion if it's the last super_admin (safety check)
        IF OLD.id = current_user_id AND NEW.role != 'super_admin' THEN
            IF (SELECT count(*) FROM public.profiles WHERE role = 'super_admin') <= 1 THEN
                RAISE EXCEPTION 'Não é possível remover o último Super Administrador da plataforma.';
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- admin can promote/demote reviewer <-> customer
    IF current_user_role = 'admin' THEN
        -- Check if target user is admin or super_admin
        IF OLD.role IN ('admin', 'super_admin') THEN
            RAISE EXCEPTION 'Administradores não podem alterar permissões de outros administradores ou super administradores.';
        END IF;

        -- Check if new role is admin or super_admin
        IF NEW.role IN ('admin', 'super_admin') THEN
            RAISE EXCEPTION 'Administradores não podem promover usuários para Admin ou Super Admin.';
        END IF;

        -- Check if user is trying to change their own role
        IF OLD.id = current_user_id THEN
            RAISE EXCEPTION 'Administradores não podem alterar suas próprias permissões.';
        END IF;

        RETURN NEW;
    END IF;

    -- Any other role is unauthorized
    RAISE EXCEPTION 'Permissão negada. Você não tem autoridade para gerenciar papéis de usuário.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to log role changes automatically
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public.role_change_logs (actor_id, target_id, old_role, new_role)
        VALUES (auth.uid(), NEW.id, OLD.role, NEW.role);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_role_change ON public.profiles;
CREATE TRIGGER tr_log_role_change
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_change();

-- 4. Documentation
COMMENT ON TABLE public.role_change_logs IS 'Audit log for user role transitions.';
COMMENT ON FUNCTION public.enforce_role_management IS 'Enforces the governance hierarchy for role updates.';
