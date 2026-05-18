-- Add terms of use and moderation awareness fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT,
ADD COLUMN IF NOT EXISTS last_warning_at TIMESTAMPTZ;

-- Comment on columns for documentation
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'When the user accepted the terms of use';
COMMENT ON COLUMN public.profiles.terms_version IS 'The version of terms of use accepted by the user';
COMMENT ON COLUMN public.profiles.last_warning_at IS 'Timestamp of the most recent moderation warning sent to the user';

-- Ensure these columns are accessible to the user themselves and admins
-- (RLS is already enabled on profiles, usually owner can read/write their own row)
