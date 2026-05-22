-- Reviewer Reputation System Foundation
-- This migration creates the necessary view to calculate approved review counts
-- while respecting moderation and business freezing rules.

-- 1. Create the reviewer stats view
-- It counts reviews where the business is NOT frozen.
-- This view will be the source of truth for the reputation badge system.
CREATE OR REPLACE VIEW public.reviewer_stats AS
SELECT 
    r.user_id,
    COUNT(r.id) as approved_reviews_count
FROM 
    public.reviews r
JOIN 
    public.businesses b ON r.business_id = b.id
WHERE 
    r.user_id IS NOT NULL
    AND b.is_frozen = false
GROUP BY 
    r.user_id;

-- 2. Grant access to the view
GRANT SELECT ON public.reviewer_stats TO anon, authenticated, service_role;

-- 3. Create a function to fetch reviews with reviewer stats in a single call
-- This avoids multiple queries and client-side joins.
CREATE OR REPLACE FUNCTION public.get_business_reviews_with_stats(b_id uuid)
RETURNS TABLE (
    id uuid,
    business_id uuid,
    rating integer,
    feedback text,
    display_name text,
    created_at timestamp with time zone,
    user_id uuid,
    author_role text,
    author_review_count bigint
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
        COALESCE(s.approved_reviews_count, 0)::bigint as author_review_count
    FROM 
        public.reviews r
    LEFT JOIN 
        public.profiles p ON r.user_id = p.id
    LEFT JOIN 
        public.reviewer_stats s ON r.user_id = s.user_id
    WHERE 
        r.business_id = b_id
    ORDER BY 
        r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_business_reviews_with_stats(uuid) TO anon, authenticated, service_role;

-- 5. Comment for documentation
COMMENT ON VIEW public.reviewer_stats IS 'Calculates approved/active review counts per user for the reputation badge system.';
COMMENT ON FUNCTION public.get_business_reviews_with_stats(uuid) IS 'Fetches reviews for a business including author role and reputation stats.';
