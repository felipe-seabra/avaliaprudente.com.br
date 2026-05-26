-- Align Subscription Plans with Commercial Strategy
-- This migration updates the subscription_plans table to match the centralized definitions in src/lib/subscription-config.ts

-- 1. Update Plans
-- We use slugs as the unique identifier

-- Free Plan
UPDATE public.subscription_plans 
SET 
    name = 'Gratuito',
    description = 'Ideal para começar e testar a plataforma.',
    features = '["basic_analytics", "google_review_gate"]'::jsonb,
    quotas = '{"business_limit": 1, "monthly_reviews": 20}'::jsonb,
    sort_order = 0
WHERE slug = 'free';

-- Pro Plan (Ensure it exists and has correct technical keys)
INSERT INTO public.subscription_plans (slug, name, description, features, quotas, sort_order, is_active)
VALUES (
    'pro', 
    'Pro', 
    'Recursos avançados para profissionais.', 
    '["basic_analytics", "google_review_gate", "custom_colors", "ai_replies"]'::jsonb,
    '{"business_limit": 3, "monthly_reviews": 100}'::jsonb,
    1,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    quotas = EXCLUDED.quotas,
    sort_order = EXCLUDED.sort_order;

-- Business Plan
INSERT INTO public.subscription_plans (slug, name, description, features, quotas, sort_order, is_active)
VALUES (
    'business', 
    'Business', 
    'O poder máximo do NFC com suporte prioritário.', 
    '["advanced_analytics", "google_review_gate", "custom_colors", "custom_branding", "ai_replies", "data_export"]'::jsonb,
    '{"business_limit": 10, "monthly_reviews": 500}'::jsonb,
    2,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    quotas = EXCLUDED.quotas,
    sort_order = EXCLUDED.sort_order;

-- Enterprise Plan
UPDATE public.subscription_plans
SET
    name = 'Enterprise',
    description = 'Solução sob medida para grandes redes e franquias.',
    features = '["basic_analytics", "advanced_analytics", "google_review_gate", "custom_colors", "custom_branding", "ai_replies", "data_export", "api_access", "multi_user"]'::jsonb,
    quotas = '{"business_limit": 100, "monthly_reviews": 10000}'::jsonb,
    sort_order = 3
WHERE slug = 'enterprise';

-- Cleanup Starter if it exists (we consolidated it into Pro)
DELETE FROM public.subscription_plans WHERE slug = 'starter' AND id NOT IN (SELECT plan_id FROM public.user_subscriptions);
-- If there are users on 'starter', move them to 'pro'
DO $$
DECLARE
    starter_id UUID;
    pro_id UUID;
BEGIN
    SELECT id INTO starter_id FROM public.subscription_plans WHERE slug = 'starter';
    SELECT id INTO pro_id FROM public.subscription_plans WHERE slug = 'pro';
    
    IF starter_id IS NOT NULL AND pro_id IS NOT NULL THEN
        UPDATE public.user_subscriptions SET plan_id = pro_id WHERE plan_id = starter_id;
        DELETE FROM public.subscription_plans WHERE id = starter_id;
    END IF;
END $$;
