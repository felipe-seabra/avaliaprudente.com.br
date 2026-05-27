'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, AlertTriangle, ShieldCheck } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSubscription } from '@/providers/subscription-provider'
import Link from 'next/link'

interface PlanBadgeProps {
  showIcon?: boolean
  showUpgradeAction?: boolean
  className?: string
}

/**
 * PlanBadge component that safely renders the user's current subscription plan.
 */
export function PlanBadge({ 
  showIcon = true, 
  showUpgradeAction = true,
  className 
}: PlanBadgeProps) {
  const { subscription, isSuperAdmin, isLoading } = useSubscription()

  if (isLoading) {
    return <Badge variant="outline" className="animate-pulse">Carregando...</Badge>
  }

  if (isSuperAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={
            <Badge 
              variant="default" 
              className={`cursor-default gap-1.5 px-3 py-1 font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-primary/20 shadow-sm ${className}`}
            >
              {showIcon && <ShieldCheck className="h-3 w-3" />}
              Super Admin
            </Badge>
          } />
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-bold">Acesso Ilimitado</p>
              <p>Como Super Administrador, você possui privilégios totais na plataforma.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!subscription) {
    return null
  }

  const { plan, status } = subscription
  const isFree = plan.slug === 'free'
  const isSuspended = status === 'suspended'
  const isExpired = status === 'expired'

  const variant = isFree ? 'secondary' : 'default'
  
  return (
    <div className="flex items-center gap-3">
      {isFree && showUpgradeAction && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={
              <Button 
                size="sm" 
                variant="outline"
                render={<Link href="/dashboard/billing" />}
                className="h-7 px-3 text-[10px] font-bold gap-1.5 border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
              >
                <Zap className="h-3.5 w-3.5 fill-primary text-primary" />
                Fazer Upgrade
              </Button>
            } />
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">Libere recursos avançados!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={
            <Badge 
              variant={isSuspended || isExpired ? 'destructive' : variant} 
              className={`cursor-default gap-1.5 px-3 py-1 font-bold uppercase tracking-wider text-[10px] ${!isFree && !isSuspended && !isExpired ? 'bg-primary/10 text-primary border-primary/20' : ''} ${className}`}
            >
              {showIcon && (isSuspended || isExpired) && <AlertTriangle className="h-3 w-3" />}
              {showIcon && !isFree && !isSuspended && !isExpired && <Sparkles className="h-3 w-3 fill-current" />}
              {plan.name}
              {isSuspended && ' (Suspenso)'}
              {isExpired && ' (Expirado)'}
            </Badge>
          } />
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-bold">{plan.name}</p>
              <p>{plan.description}</p>
              {(isSuspended || isExpired) && (
                <p className="text-destructive font-bold mt-1">
                  Sua assinatura está {isSuspended ? 'suspensa' : 'expirada'}.
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
