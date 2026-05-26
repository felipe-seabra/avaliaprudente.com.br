import { ReactNode } from 'react'
import { canUseFeature } from '@/lib/subscriptions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  title?: string
  description?: string
}

/**
 * Server Component that wraps content and only renders it if the user has the required feature entitlement.
 */
export async function FeatureGate({
  feature,
  children,
  fallback,
  title = 'Recurso Premium',
  description = 'Este recurso não está disponível no seu plano atual.',
}: FeatureGateProps) {
  const hasAccess = await canUseFeature(feature)

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
        <Button render={<Link href="/dashboard/billing" />} variant="secondary">
          Ver Planos e Upgrade
        </Button>
      </CardContent>
    </Card>
  )
}
