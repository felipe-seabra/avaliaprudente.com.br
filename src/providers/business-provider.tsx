'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Business } from '@/core/domain/entities'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { toast } from 'sonner'
import { parseError, logError } from '@/lib/error-handler'

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
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isInitialLoad = useRef(true)
  const repository = useMemo(() => new BusinessRepository(), [])

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

  const refreshBusinesses = useCallback(async () => {
    try {
      const data = await repository.getAll()
      setBusinesses(data)
      
      if (data.length > 0) {
        const storedId = getStoredId()
        const storedBusiness = data.find(b => b.id === storedId)
        
        if (storedBusiness) {
          setCurrentBusiness(storedBusiness)
        } else {
          // If no stored business or it no longer exists, 
          // check if current business is still valid
          setCurrentBusiness(prev => {
            if (prev && data.find(b => b.id === prev.id)) {
              return prev
            }
            return data[0]
          })
        }
      } else {
        setCurrentBusiness(null)
      }
    } catch (error: unknown) {
      logError(error, 'Refresh Businesses')
      const normalized = parseError(error)
      toast.error('Erro ao carregar empresas', { description: normalized.message })
    } finally {
      setIsLoading(false)
      isInitialLoad.current = false
    }
  }, [repository, getStoredId])

  useEffect(() => {
    refreshBusinesses()
  }, [refreshBusinesses])

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
