'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Business } from '@/core/domain/entities'
import { useBusinesses } from '@/hooks/use-dashboard-queries'
import { useQueryClient } from '@tanstack/react-query'

const STORAGE_KEY = 'avaliaprudente_selected_business_id'

interface BusinessContextType {
  businesses: Business[]
  currentBusiness: Business | null
  setCurrentBusiness: (business: Business) => void
  isLoading: boolean
  refreshBusinesses: () => Promise<void>
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const isInitialLoad = useRef(true)
  const queryClient = useQueryClient()
  
  const { data: businesses = [], isLoading, refetch } = useBusinesses()

  // Safely get item from localStorage
  const getStoredId = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }, [])

  // Safely set item in localStorage
  const setStoredId = useCallback((id: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Ignore storage errors
    }
  }, [])

  const selectBusiness = useCallback((business: Business) => {
    setCurrentBusiness(business)
    setStoredId(business.id)
  }, [setStoredId])

  useEffect(() => {
    if (!isLoading && businesses.length > 0 && isInitialLoad.current) {
      const storedId = getStoredId()
      const storedBusiness = businesses.find(b => b.id === storedId)
      
      if (storedBusiness) {
        setCurrentBusiness(storedBusiness)
      } else {
        setCurrentBusiness(businesses[0])
      }
      isInitialLoad.current = false
    } else if (!isLoading && businesses.length === 0) {
      setCurrentBusiness(null)
      isInitialLoad.current = false
    }
  }, [isLoading, businesses, getStoredId])

  const refreshBusinesses = async () => {
    await refetch()
    queryClient.invalidateQueries({ queryKey: ['businesses'] })
  }

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness: selectBusiness,
        isLoading,
        refreshBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
