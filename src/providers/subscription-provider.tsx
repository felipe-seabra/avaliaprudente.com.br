'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserSubscription } from '@/lib/subscription-config'

interface SubscriptionContextType {
  subscription: UserSubscription | null
  role: string | null
  isSuperAdmin: boolean
  isLoading: boolean
  canUseFeature: (feature: string) => boolean
  getQuota: (quotaKey: string) => number
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSubscription(null)
        setRole(null)
        return
      }

      // Fetch subscription and profile
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

      if (subResult.error) {
        setSubscription(null)
      } else {
        // Cast DB result to UserSubscription, acknowledging the JSONB fields and missing price/metadata
        setSubscription(subResult.data as unknown as UserSubscription)
      }

      setRole(profileResult.data?.role || null)
    } catch (err) {
      console.error('[Subscription Provider] Unexpected error:', err)
      setSubscription(null)
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const isSuperAdmin = role === 'super_admin'

  const canUseFeature = useCallback((feature: string) => {
    if (isSuperAdmin) return true
    if (!subscription) return false
    if (subscription.status === 'suspended' || subscription.status === 'expired') return false
    return Array.isArray(subscription.plan.features) && subscription.plan.features.includes(feature)
  }, [isSuperAdmin, subscription])

  const getQuota = useCallback((quotaKey: string) => {
    if (isSuperAdmin) return 999999
    if (!subscription) return 0
    if (subscription.status === 'suspended' || subscription.status === 'expired') return 0
    const quotas = subscription.plan.quotas as Record<string, number>
    return quotas[quotaKey] ?? 0
  }, [isSuperAdmin, subscription])

  useEffect(() => {
    fetchSubscription()
    
    // Listen for auth changes
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription()
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [supabase, fetchSubscription])

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        role,
        isSuperAdmin,
        isLoading,
        canUseFeature,
        getQuota,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
