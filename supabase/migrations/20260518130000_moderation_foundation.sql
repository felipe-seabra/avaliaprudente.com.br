-- Moderation System Phase 1 Foundation

-- 1. Update profiles table with moderation fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS warning_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'warned'));

-- 2. Create moderation_actions table for auditability
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  admin_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('warning')),
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Admins only)
CREATE POLICY "Admins can view all moderation actions"
  ON public.moderation_actions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert moderation actions"
  ON public.moderation_actions FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) AND 
    auth.uid() != target_user_id -- Admins cannot warn themselves
  );

-- 5. Helper function to process warnings (increments count and updates status)
CREATE OR REPLACE FUNCTION public.process_user_warning()
RETURNS trigger AS $$
BEGIN
  -- Increment warning_count on profile
  UPDATE public.profiles
  SET 
    warning_count = warning_count + 1,
    account_status = 'warned',
    updated_at = now()
  WHERE id = NEW.target_user_id;

  -- Create a notification for the user
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.target_user_id,
    'Aviso de Moderação',
    'Você recebeu um aviso formal: ' || NEW.reason,
    'warning'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to automate warning processing
DROP TRIGGER IF EXISTS on_warning_created ON public.moderation_actions;
CREATE TRIGGER on_warning_created
  AFTER INSERT ON public.moderation_actions
  FOR EACH ROW
  WHEN (NEW.action_type = 'warning')
  EXECUTE PROCEDURE public.process_user_warning();

-- 7. Index for performance
CREATE INDEX IF NOT EXISTS idx_moderation_target ON public.moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_created_at ON public.moderation_actions(created_at DESC);
