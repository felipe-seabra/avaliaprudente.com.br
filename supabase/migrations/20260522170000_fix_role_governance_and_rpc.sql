-- Fix Role Governance and RPC security issues found during Audit

-- 1. Fix enforce_role_management to allow self-promotion (reviewer -> customer) and service_role
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

    -- Allow Service Role to do anything (auth.uid() is null or role is service_role)
    IF current_user_id IS NULL OR auth.role() = 'service_role' THEN
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

    -- Allow user to self-upgrade from reviewer to customer
    IF OLD.id = current_user_id AND OLD.role = 'reviewer' AND NEW.role = 'customer' THEN
        RETURN NEW;
    END IF;

    -- Any other role is unauthorized
    RAISE EXCEPTION 'Permissão negada. Você não tem autoridade para gerenciar papéis de usuário.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_business_reviews_with_stats RPC to filter suspended users and frozen businesses
CREATE OR REPLACE FUNCTION public.get_business_reviews_with_stats(
    b_id uuid,
    p_limit integer DEFAULT 5,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    rating integer,
    feedback text,
    display_name text,
    created_at timestamp with time zone,
    user_id uuid,
    author_role text,
    author_review_count bigint,
    response_id uuid,
    response_content text,
    response_author_role public.user_role,
    response_created_at timestamp with time zone,
    total_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.business_id,
        r.rating,
        r.feedback,
        r.display_name,
        r.created_at,
        r.user_id,
        p.role::text as author_role,
        COALESCE(s.approved_reviews_count, 0)::bigint as author_review_count,
        rr.id as response_id,
        rr.content as response_content,
        rr.author_role as response_author_role,
        rr.created_at as response_created_at,
        COUNT(*) OVER() as total_count
    FROM 
        public.reviews r
    LEFT JOIN 
        public.profiles p ON r.user_id = p.id
    LEFT JOIN 
        public.reviewer_stats s ON r.user_id = s.user_id
    LEFT JOIN
        public.review_responses rr ON r.id = rr.review_id AND rr.deleted_at IS NULL
    WHERE 
        r.business_id = b_id
        AND NOT public.is_suspended(r.user_id)
        AND NOT public.is_business_frozen(r.business_id)
    ORDER BY 
        r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
