-- Update get_business_reviews_with_stats to support pagination
DROP FUNCTION IF EXISTS public.get_business_reviews_with_stats(uuid);

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
    ORDER BY 
        r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_business_reviews_with_stats(uuid, integer, integer) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_business_reviews_with_stats(uuid, integer, integer) IS 'Fetches reviews for a business including author role, reputation stats, official responses, and total count for pagination.';
