-- Allow users to view their own moderation actions
CREATE POLICY "Users can view their own moderation actions"
  ON public.moderation_actions FOR SELECT
  USING (auth.uid() = target_user_id);

-- Ensure profiles can be updated by the user for terms_version (for re-acceptance)
-- Assuming they can already update their own profile, but let's be sure about these specific columns
-- Usually there is a "Users can update own profile" policy.
