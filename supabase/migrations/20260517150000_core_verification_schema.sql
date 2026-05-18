-- 1. Add verification fields to businesses table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'is_verified') THEN
        ALTER TABLE public.businesses ADD COLUMN is_verified boolean NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'verification_status') THEN
        ALTER TABLE public.businesses ADD COLUMN verification_status text DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'verified_at') THEN
        ALTER TABLE public.businesses ADD COLUMN verified_at timestamptz NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'verified_by') THEN
        ALTER TABLE public.businesses ADD COLUMN verified_by uuid NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'verification_requested_at') THEN
        ALTER TABLE public.businesses ADD COLUMN verification_requested_at timestamptz NULL;
    END IF;
END $$;

-- 2. Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now() NOT NULL,
    reviewed_at timestamptz NULL,
    reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.verification_requests;
CREATE POLICY "Users can view their own requests"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own requests" ON public.verification_requests;
CREATE POLICY "Users can create their own requests"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;
CREATE POLICY "Admins can view all requests"
    ON public.verification_requests FOR SELECT
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can update requests" ON public.verification_requests;
CREATE POLICY "Admins can update requests"
    ON public.verification_requests FOR UPDATE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Admin Rule: Auto-verify businesses created by admins
CREATE OR REPLACE FUNCTION public.handle_admin_business_verification()
RETURNS trigger AS $$
DECLARE
    creator_role text;
BEGIN
    -- Get role of the creator
    SELECT role INTO creator_role FROM public.profiles WHERE id = auth.uid();

    IF creator_role = 'admin' THEN
        new.is_verified := true;
        new.verification_status := 'approved';
        new.verified_at := now();
        new.verified_by := auth.uid();
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created_verification ON public.businesses;
CREATE TRIGGER on_business_created_verification
    BEFORE INSERT ON public.businesses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_business_verification();

-- 6. Ensure existing admin businesses are verified
UPDATE public.businesses b
SET 
    is_verified = true,
    verification_status = 'approved',
    verified_at = now(),
    verified_by = b.owner_id
FROM public.profiles p
WHERE b.owner_id = p.id AND p.role = 'admin' AND b.is_verified = false;

