'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function UpgradePage() {
  const router = useRouter()

  useEffect(() => {
    // We are unifying the upgrade and onboarding flow for a better experience.
    // This new flow includes business creation, password setup, and terms acceptance.
    router.replace('/onboarding')
  }, [router])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse font-medium">
        Redirecionando para o fluxo de configuração...
      </p>
    </div>
  )
}
