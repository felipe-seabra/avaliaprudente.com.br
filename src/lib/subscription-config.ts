/**
 * SINGLE SOURCE OF TRUTH for Subscription Plans
 * This file defines the technical and commercial structure of all plans.
 */

export const PLAN_SLUGS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const

export type SubscriptionStatus = 'active' | 'suspended' | 'expired' | 'trial' | 'lifetime'

export const FEATURE_KEYS = {
  BASIC_ANALYTICS: 'basic_analytics',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  GOOGLE_REVIEW_GATE: 'google_review_gate',
  CUSTOM_COLORS: 'custom_colors',
  CUSTOM_BRANDING: 'custom_branding',
  AI_REPLIES: 'ai_replies',
  DATA_EXPORT: 'data_export',
  API_ACCESS: 'api_access',
  MULTI_USER: 'multi_user',
} as const

export const QUOTA_KEYS = {
  BUSINESS_LIMIT: 'business_limit',
  MONTHLY_REVIEWS: 'monthly_reviews',
} as const

export interface PlanDefinition {
  slug: string
  name: string
  description: string
  price: number
  setupFee?: number
  features: string[]
  quotas: Record<string, number>
  isPublic: boolean
  enabled: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  plan: PlanDefinition
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDefinition> = {
  [PLAN_SLUGS.FREE]: {
    slug: PLAN_SLUGS.FREE,
    name: 'Gratuito',
    description: 'Ideal para começar e testar a plataforma.',
    price: 0,
    features: [
      FEATURE_KEYS.BASIC_ANALYTICS,
      FEATURE_KEYS.GOOGLE_REVIEW_GATE,
    ],
    quotas: {
      [QUOTA_KEYS.BUSINESS_LIMIT]: 1,
      [QUOTA_KEYS.MONTHLY_REVIEWS]: 20,
    },
    isPublic: true,
    enabled: true,
  },
  [PLAN_SLUGS.PRO]: {
    slug: PLAN_SLUGS.PRO,
    name: 'Pro',
    description: 'Recursos avançados para profissionais.',
    price: 9.90,
    features: [
      FEATURE_KEYS.BASIC_ANALYTICS,
      FEATURE_KEYS.GOOGLE_REVIEW_GATE,
      FEATURE_KEYS.CUSTOM_COLORS,
      FEATURE_KEYS.AI_REPLIES,
    ],
    quotas: {
      [QUOTA_KEYS.BUSINESS_LIMIT]: 3,
      [QUOTA_KEYS.MONTHLY_REVIEWS]: 100,
    },
    isPublic: true,
    enabled: false, // Coming soon
  },
  [PLAN_SLUGS.BUSINESS]: {
    slug: PLAN_SLUGS.BUSINESS,
    name: 'Business',
    description: 'O poder máximo do NFC com suporte prioritário.',
    price: 19.90,
    setupFee: 69.90,
    features: [
      FEATURE_KEYS.ADVANCED_ANALYTICS,
      FEATURE_KEYS.GOOGLE_REVIEW_GATE,
      FEATURE_KEYS.CUSTOM_COLORS,
      FEATURE_KEYS.CUSTOM_BRANDING,
      FEATURE_KEYS.AI_REPLIES,
      FEATURE_KEYS.DATA_EXPORT,
    ],
    quotas: {
      [QUOTA_KEYS.BUSINESS_LIMIT]: 10,
      [QUOTA_KEYS.MONTHLY_REVIEWS]: 500,
    },
    isPublic: true,
    enabled: false, // Coming soon
  },
  [PLAN_SLUGS.ENTERPRISE]: {
    slug: PLAN_SLUGS.ENTERPRISE,
    name: 'Enterprise',
    description: 'Solução sob medida para grandes redes e franquias.',
    price: 0, // Contact sales
    features: Object.values(FEATURE_KEYS),
    quotas: {
      [QUOTA_KEYS.BUSINESS_LIMIT]: 100,
      [QUOTA_KEYS.MONTHLY_REVIEWS]: 10000,
    },
    isPublic: false,
    enabled: false, // Contact sales
  },
}
