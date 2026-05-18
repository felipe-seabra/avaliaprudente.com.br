-- Moderation System Phase 2: Suspensions and Freezing

-- 1. Update profiles table with suspension fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS suspended_until timestamp with time zone;

-- Update account_status constraint to include 'suspended'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_status_check;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_account_status_check 
  CHECK (account_status IN ('active', 'warned', 'suspended'));

-- 2. Update businesses table with freezing fields
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS frozen_reason text,
  ADD COLUMN IF NOT EXISTS frozen_at timestamp with time zone;

-- 3. Update moderation_actions table constraints
ALTER TABLE public.moderation_actions DROP CONSTRAINT IF EXISTS moderation_actions_action_type_check;
ALTER TABLE public.moderation_actions 
  ADD CONSTRAINT moderation_actions_action_type_check 
  CHECK (action_type IN ('warning', 'suspension', 'reactivation', 'freeze', 'unfreeze'));

-- 4. Function to handle user suspension and freezing logic
CREATE OR REPLACE FUNCTION public.process_moderation_escalation()
RETURNS trigger AS $$
BEGIN
  -- If ACTION is SUSPENSION
  IF NEW.action_type = 'suspension' THEN
    -- Update profile status
    UPDATE public.profiles
    SET 
      account_status = 'suspended',
      suspended_until = (NEW.metadata->>'suspended_until')::timestamp with time zone,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    -- Freeze all businesses owned by this user
    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = 'Proprietário suspenso: ' || NEW.reason
    WHERE owner_id = NEW.target_user_id AND is_frozen = false;

    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Sua conta foi suspensa',
      'Sua conta foi temporariamente suspensa até ' || 
      to_char((NEW.metadata->>'suspended_until')::timestamp with time zone, 'DD/MM/YYYY HH24:MI') || 
      '. Motivo: ' || NEW.reason,
      'error'
    );

  -- If ACTION is REACTIVATION
  ELSIF NEW.action_type = 'reactivation' THEN
    -- Update profile status
    UPDATE public.profiles
    SET 
      account_status = 'active',
      suspended_until = null,
      updated_at = now()
    WHERE id = NEW.target_user_id;

    -- Unfreeze businesses frozen by suspension
    UPDATE public.businesses
    SET 
      is_frozen = false,
      frozen_at = null,
      frozen_reason = null
    WHERE owner_id = NEW.target_user_id AND frozen_reason LIKE 'Proprietário suspenso%';

    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.target_user_id,
      'Conta Reativada',
      'Sua conta foi reativada por um administrador. Bem-vindo de volta!',
      'success'
    );

  -- If ACTION is FREEZE (Individual business)
  ELSIF NEW.action_type = 'freeze' THEN
    UPDATE public.businesses
    SET 
      is_frozen = true,
      frozen_at = now(),
      frozen_reason = NEW.reason
    WHERE id = (NEW.metadata->>'business_id')::uuid;

  -- If ACTION is UNFREEZE (Individual business)
  ELSIF NEW.action_type = 'unfreeze' THEN
    UPDATE public.businesses
    SET 
      is_frozen = false,
      frozen_at = null,
      frozen_reason = null
    WHERE id = (NEW.metadata->>'business_id')::uuid;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for automated escalation
DROP TRIGGER IF EXISTS on_moderation_escalation ON public.moderation_actions;
CREATE TRIGGER on_moderation_escalation
  AFTER INSERT ON public.moderation_actions
  FOR EACH ROW
  EXECUTE PROCEDURE public.process_moderation_escalation();

-- 6. RLS Hardening for Suspended Users and Frozen Businesses

-- Helper to check if a user is suspended
CREATE OR REPLACE FUNCTION public.is_suspended(u_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = u_id
    AND account_status = 'suspended'
    AND (suspended_until IS NULL OR suspended_until > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to check if a business is frozen
CREATE OR REPLACE FUNCTION public.is_business_frozen(b_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = b_id
    AND is_frozen = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update Business RLS: Prevent creation/update if suspended
DROP POLICY IF EXISTS "Owners can manage their businesses" ON public.businesses;
CREATE POLICY "Owners can manage their businesses"
  ON public.businesses FOR ALL
  USING (
    auth.uid() = owner_id AND 
    NOT public.is_suspended(auth.uid()) AND
    NOT public.is_business_frozen(id)
  )
  WITH CHECK (
    auth.uid() = owner_id AND 
    NOT public.is_suspended(auth.uid())
  );

-- Admins can still view/update frozen businesses (inherited from previous migration policies)
-- But we need to ensure they override the "frozen" check

-- Update Business Pages RLS
DROP POLICY IF EXISTS "Owners can manage their business pages" ON public.business_pages;
CREATE POLICY "Owners can manage their business pages"
  ON public.business_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_pages.business_id
      AND businesses.owner_id = auth.uid()
      AND NOT public.is_suspended(auth.uid())
      AND NOT businesses.is_frozen
    )
  );

-- Update Page Links RLS
DROP POLICY IF EXISTS "Owners can manage their page links" ON public.page_links;
CREATE POLICY "Owners can manage their page links"
  ON public.page_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.business_pages
      JOIN public.businesses ON businesses.id = business_pages.business_id
      WHERE business_pages.id = page_links.page_id
      AND businesses.owner_id = auth.uid()
      AND NOT public.is_suspended(auth.uid())
      AND NOT businesses.is_frozen
    )
  );

-- Update Reviews RLS: Prevent posting reviews if suspended or business is frozen
DROP POLICY IF EXISTS "Anyone can insert a review" ON public.reviews;
CREATE POLICY "Anyone can insert a review"
  ON public.reviews FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL OR NOT public.is_suspended(auth.uid())) AND
    NOT public.is_business_frozen(business_id)
  );
