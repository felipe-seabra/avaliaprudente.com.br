import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export type SubscriptionStatus = 'active' | 'suspended' | 'expired' | 'trial' | 'lifetime'

export interface SubscriptionPlan {
  id: string
  slug: string
  name: string
  description: string | null
  features: string[]
  quotas: Record<string, number>
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  plan: SubscriptionPlan
}

/**
 * Fetch current user's subscription with plan details.
 * Cached per request for performance.
 */
export const getUserSubscription = cache(async (): Promise<UserSubscription | null> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    // Fallback: If no subscription found (should not happen due to triggers), 
    // we could return a default free plan state if needed, but returning null 
    // allows the UI to handle the missing state gracefully.
    return null
  }

  return data as UserSubscription
})

/**
 * Checks if the user has access to a specific feature.
 */
export async function canUseFeature(feature: string): Promise<boolean> {
  const subscription = await getUserSubscription()
  if (!subscription) return false
  
  // Lifetime status grants everything? Or we still check plan features?
  // Usually lifetime is just a status, features still come from the plan.
  if (subscription.status === 'suspended' || subscription.status === 'expired') {
    return false
  }

  return subscription.plan.features.includes(feature)
}

/**
 * Gets a specific quota value for the user.
 */
export async function getQuota(quotaKey: string): Promise<number> {
  const subscription = await getUserSubscription()
  if (!subscription) return 0
  
  if (subscription.status === 'suspended' || subscription.status === 'expired') {
    return 0
  }

  return subscription.plan.quotas[quotaKey] ?? 0
}

/**
 * Feature keys constants to avoid typos.
 */
export const FEATURES = {
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

/**
 * Quota keys constants.
 */
export const QUOTAS = {
  BUSINESS_LIMIT: 'business_limit',
  MONTHLY_REVIEWS: 'monthly_reviews',
} as const
