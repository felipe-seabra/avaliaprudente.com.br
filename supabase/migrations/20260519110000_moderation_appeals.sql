-- Moderation System Phase 3: Appeals & Resolution

-- 1. Create moderation_appeals table
CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderation_action_id uuid REFERENCES public.moderation_actions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  message text NOT NULL,
  admin_response text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Enable RLS
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view their own appeals"
  ON public.moderation_appeals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own appeals"
  ON public.moderation_appeals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all appeals"
  ON public.moderation_appeals FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update appeals"
  ON public.moderation_appeals FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 4. Helper function to handle appeal resolution (automatic reversal of moderation if approved)
CREATE OR REPLACE FUNCTION public.process_appeal_resolution()
RETURNS trigger AS $$
DECLARE
  v_action_type text;
  v_target_user_id uuid;
  v_metadata jsonb;
BEGIN
  -- Only trigger if status changed to approved or rejected
  IF NEW.status = OLD.status OR NEW.status NOT IN ('approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  -- Get original action details
  SELECT action_type, target_user_id, metadata 
  INTO v_action_type, v_target_user_id, v_metadata
  FROM public.moderation_actions 
  WHERE id = NEW.moderation_action_id;

  -- If appeal is APPROVED, reverse the moderation action
  IF NEW.status = 'approved' THEN
    -- Insert a reactivation/unfreeze action to track the reversal
    INSERT INTO public.moderation_actions (target_user_id, admin_user_id, action_type, reason, metadata)
    VALUES (
      v_target_user_id,
      NEW.reviewed_by,
      CASE 
        WHEN v_action_type = 'warning' THEN 'reactivation' -- Reuse reactivation to reset status
        WHEN v_action_type = 'suspension' THEN 'reactivation'
        WHEN v_action_type = 'ban' THEN 'reactivation'
        WHEN v_action_type = 'freeze' THEN 'unfreeze'
        ELSE 'reactivation'
      END,
      'Apelação aprovada: ' || NEW.admin_response,
      v_metadata
    );

    -- If it was a warning, we need to manually decrement warning_count as 'reactivation' resets status but doesn't decrement count automatically in current process_moderation_escalation
    IF v_action_type = 'warning' THEN
      UPDATE public.profiles 
      SET warning_count = GREATEST(0, warning_count - 1)
      WHERE id = v_target_user_id;
    END IF;

    -- Send notification to user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_target_user_id,
      'Sua apelação foi aprovada',
      'Após revisão, a ação de moderação foi revertida. ' || COALESCE(NEW.admin_response, ''),
      'success'
    );

  ELSIF NEW.status = 'rejected' THEN
    -- Send notification to user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_target_user_id,
      'Sua apelação foi rejeitada',
      'Após revisão, a ação de moderação foi mantida. ' || COALESCE(NEW.admin_response, ''),
      'error'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for appeal resolution
CREATE TRIGGER on_appeal_resolved
  AFTER UPDATE ON public.moderation_appeals
  FOR EACH ROW
  EXECUTE PROCEDURE public.process_appeal_resolution();

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_appeals_user ON public.moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_action ON public.moderation_appeals(moderation_action_id);
