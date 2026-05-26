'use client'

import { ReactNode } from 'react'
import { useSubscription } from '@/providers/subscription-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface ClientFeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  title?: string
  description?: string
}

/**
 * Client Component that wraps content and only renders it if the user has the required feature entitlement.
 */
export function ClientFeatureGate({
  feature,
  children,
  fallback,
  title = 'Recurso Premium',
  description = 'Este recurso não está disponível no seu plano atual.',
}: ClientFeatureGateProps) {
  const { canUseFeature, isLoading } = useSubscription()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 w-full rounded-xl" />
  }

  const hasAccess = canUseFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button 
          variant="secondary"
          render={
            <Link href="/dashboard/billing">
              Ver Planos e Upgrade
            </Link>
          }
          nativeButton={false}
        />
      </CardContent>
    </Card>
  )
}
