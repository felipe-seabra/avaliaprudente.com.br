'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserSubscription } from '@/lib/subscriptions'

interface SubscriptionContextType {
  subscription: UserSubscription | null
  isLoading: boolean
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSubscription(null)
        return
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('[Subscription Provider] Error fetching subscription:', error)
        setSubscription(null)
      } else {
        setSubscription(data as UserSubscription)
      }
    } catch (err) {
      console.error('[Subscription Provider] Unexpected error:', err)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

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
        isLoading,
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
