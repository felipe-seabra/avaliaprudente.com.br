-- Subscription Foundation
-- Production-grade subscription and entitlement foundation.

-- 1. subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    monthly_price_placeholder DECIMAL(10, 2),
    yearly_price_placeholder DECIMAL(10, 2),
    features JSONB DEFAULT '[]'::jsonb NOT NULL,
    quotas JSONB DEFAULT '{}'::jsonb NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'expired', 'trial', 'lifetime')),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_reason TEXT,
    source TEXT NOT NULL, -- 'admin', 'future_stripe', etc.
    starts_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. subscription_audit_logs
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'plan_assigned', 'plan_removed', 'status_changed', etc.
    previous_plan_id UUID REFERENCES public.subscription_plans(id),
    new_plan_id UUID REFERENCES public.subscription_plans(id),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Policies using existing helpers

-- Plans: Viewable by everyone, manageable by super_admin
CREATE POLICY "Everyone can view active plans"
    ON public.subscription_plans
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Super admins can manage plans"
    ON public.subscription_plans
    FOR ALL
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- User Subscriptions: Users can view their own, super_admins can manage all
CREATE POLICY "Users can view their own subscription"
    ON public.user_subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all subscriptions"
    ON public.user_subscriptions
    FOR ALL
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- Audit Logs: Super admins only
CREATE POLICY "Only super_admin can view subscription audit logs"
    ON public.subscription_audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- Seed Initial Plans
INSERT INTO public.subscription_plans (slug, name, description, features, quotas, sort_order)
VALUES 
('free', 'Grátis', 'Ideal para começar e testar a plataforma.', '["basic_analytics", "google_review_gate"]', '{"business_limit": 1, "monthly_reviews": 10}', 0),
('starter', 'Starter', 'Para pequenos negócios em crescimento.', '["basic_analytics", "google_review_gate", "custom_colors"]', '{"business_limit": 3, "monthly_reviews": 50}', 1),
('pro', 'Pro', 'Recursos avançados para profissionais.', '["advanced_analytics", "google_review_gate", "custom_branding", "ai_replies", "data_export"]', '{"business_limit": 10, "monthly_reviews": 250}', 2),
('enterprise', 'Enterprise', 'Solução completa para grandes empresas.', '["advanced_analytics", "google_review_gate", "custom_branding", "ai_replies", "data_export", "api_access", "multi_user"]', '{"business_limit": 100, "monthly_reviews": 10000}', 3)
ON CONFLICT (slug) DO NOTHING;

-- Updated at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_subscription_updated
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Auto-assign Free Plan on Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
    default_plan_id UUID;
BEGIN
    SELECT id INTO default_plan_id FROM public.subscription_plans WHERE slug = 'free';
    
    IF default_plan_id IS NOT NULL THEN
        INSERT INTO public.user_subscriptions (user_id, plan_id, status, source)
        VALUES (NEW.id, default_plan_id, 'active', 'system');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We attach this to profiles because handle_new_user trigger already exists for profiles.
-- We want to ensure the profile exists first if we ever link subscriptions to profiles, 
-- but since user_subscriptions links to auth.users, it's safer to attach to profiles 
-- to follow the existing pattern of expanding user data.
CREATE TRIGGER on_profile_created_assign_subscription
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user_subscription();

-- Backfill existing users (Optional but good for completeness)
DO $$
DECLARE
    default_plan_id UUID;
    p_record RECORD;
BEGIN
    SELECT id INTO default_plan_id FROM public.subscription_plans WHERE slug = 'free';
    
    IF default_plan_id IS NOT NULL THEN
        FOR p_record IN SELECT id FROM public.profiles LOOP
            INSERT INTO public.user_subscriptions (user_id, plan_id, status, source)
            VALUES (p_record.id, default_plan_id, 'active', 'system')
            ON CONFLICT (user_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_logs_user_id ON public.subscription_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_logs_created_at ON public.subscription_audit_logs(created_at);
