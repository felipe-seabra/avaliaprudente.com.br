-- Audit Logging Triggers for Sensitive Operations

CREATE OR REPLACE FUNCTION public.log_business_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
    VALUES (
        auth.uid(),
        'business_deleted',
        'businesses',
        OLD.id::text,
        jsonb_build_object('slug', OLD.slug, 'name', OLD.name)
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_business_deletion ON public.businesses;
CREATE TRIGGER tr_audit_business_deletion
AFTER DELETE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.log_business_deletion();

-- Profile deactivation trigger
CREATE OR REPLACE FUNCTION public.log_profile_deactivation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
        INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
        VALUES (
            auth.uid(),
            'account_deactivation',
            'profiles',
            OLD.id::text,
            jsonb_build_object('role', OLD.role)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_profile_deactivation ON public.profiles;
CREATE TRIGGER tr_audit_profile_deactivation
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.is_deleted = true AND OLD.is_deleted = false)
EXECUTE FUNCTION public.log_profile_deactivation();
