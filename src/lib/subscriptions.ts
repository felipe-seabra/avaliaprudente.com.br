import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { PlanDefinition } from './subscription-config'

export type SubscriptionStatus = 'active' | 'suspended' | 'expired' | 'trial' | 'lifetime'

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  plan: PlanDefinition
}

/**
 * Fetch current user's subscription with plan details and user role.
 * Cached per request for performance.
 */
export const getUserSubscription = cache(async (): Promise<{ 
  subscription: UserSubscription | null; 
  role: string | null;
  isSuperAdmin: boolean;
} | null> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch subscription and profile in parallel
  const [subResult, profileResult] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
  ])

  const role = profileResult.data?.role || null
  const isSuperAdmin = role === 'super_admin'

  if (subResult.error || !subResult.data) {
    return { subscription: null, role, isSuperAdmin }
  }

  return { 
    subscription: subResult.data as UserSubscription, 
    role,
    isSuperAdmin
  }
})

/**
 * Checks if the user has access to a specific feature.
 * Super admins bypass all feature checks.
 */
export async function canUseFeature(feature: string): Promise<boolean> {
  const result = await getUserSubscription()
  if (!result) return false
  
  // Super Admin Bypass
  if (result.isSuperAdmin) return true

  const { subscription } = result
  if (!subscription) return false
  
  if (subscription.status === 'suspended' || subscription.status === 'expired') {
    return false
  }

  // Check if feature exists in the plan's feature list
  // Features are stored as an array of strings in the DB
  return Array.isArray(subscription.plan.features) && subscription.plan.features.includes(feature)
}

/**
 * Gets a specific quota value for the user.
 * Super admins have "unlimited" quotas (represented by -1 or very large number).
 */
export async function getQuota(quotaKey: string): Promise<number> {
  const result = await getUserSubscription()
  if (!result) return 0
  
  // Super Admin Bypass: Return "unlimited"
  if (result.isSuperAdmin) return 999999

  const { subscription } = result
  if (!subscription) return 0
  
  if (subscription.status === 'suspended' || subscription.status === 'expired') {
    return 0
  }

  // Quotas are stored as JSONB in the DB
  const quotas = subscription.plan.quotas as Record<string, number>
  return quotas[quotaKey] ?? 0
}

/**
 * Feature keys constants to avoid typos.
 * Re-exporting from config for convenience.
 */
export { FEATURE_KEYS as FEATURES, QUOTA_KEYS as QUOTAS } from './subscription-config'
