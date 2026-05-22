-- Review Responses Architecture
-- This migration introduces the official response system for reviews, allowing business owners and admins to engage with customers.

-- 1. Create review_responses table
CREATE TABLE IF NOT EXISTS public.review_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_role public.user_role NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Anyone can view responses that are not soft-deleted
CREATE POLICY "Public can view responses"
    ON public.review_responses
    FOR SELECT
    USING (deleted_at IS NULL);

-- Admins and Super Admins can manage all responses
CREATE POLICY "Admins can manage all review responses"
    ON public.review_responses
    FOR ALL
    USING (public.is_admin(auth.uid()));

-- Business owners can manage responses for their own businesses
CREATE POLICY "Owners can manage their business responses"
    ON public.review_responses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE id = business_id
            AND owner_id = auth.uid()
        )
    );

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_review_responses_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_review_responses_updated_at
    BEFORE UPDATE ON public.review_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_review_responses_updated_at();

-- 4. Notification Trigger
-- Notifies the reviewer when a response is posted
CREATE OR REPLACE FUNCTION public.notify_reviewer_on_response()
RETURNS trigger AS $$
DECLARE
    v_reviewer_id uuid;
    v_biz_name text;
BEGIN
    -- Get reviewer_id and business name
    SELECT r.user_id, b.name INTO v_reviewer_id, v_biz_name
    FROM public.reviews r
    JOIN public.businesses b ON b.id = r.business_id
    WHERE r.id = NEW.review_id;

    -- Only notify if the review was made by an authenticated user
    IF v_reviewer_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_reviewer_id,
            'Sua avaliação recebeu uma resposta',
            'A empresa ' || v_biz_name || ' enviou uma resposta oficial ao seu comentário.',
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_notify_reviewer_on_response
    AFTER INSERT ON public.review_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_reviewer_on_response();

-- 5. Indexes for performance
CREATE INDEX idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX idx_review_responses_business_id ON public.review_responses(business_id);
CREATE INDEX idx_review_responses_author_id ON public.review_responses(author_id);
CREATE INDEX idx_review_responses_deleted_at ON public.review_responses(deleted_at) WHERE deleted_at IS NULL;

-- 6. Update get_business_reviews_with_stats RPC
-- This allows fetching reviews and their official responses in a single call.
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
    author_review_count bigint,
    response_id uuid,
    response_content text,
    response_author_role public.user_role,
    response_created_at timestamp with time zone
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
        rr.created_at as response_created_at
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
        r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Documentation
COMMENT ON TABLE public.review_responses IS 'Official responses to reviews from business owners or platform admins.';
COMMENT ON COLUMN public.review_responses.author_role IS 'Role of the author at the time of response to determine display labels.';
COMMENT ON FUNCTION public.get_business_reviews_with_stats(uuid) IS 'Fetches reviews for a business including author role, reputation stats, and official responses.';
