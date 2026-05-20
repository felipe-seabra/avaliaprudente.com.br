'use client'

import React, { useContext } from 'react'
import { Badge } from '@/components/ui/badge'
import { BusinessContext } from '@/providers/business-provider'
import { Sparkles } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PlanBadgeProps {
  showIcon?: boolean
  className?: string
}

/**
 * PlanBadge component that safely renders the business plan status.
 * It handles cases where it might be rendered outside of a BusinessProvider
 * (like in Admin area) by gracefully returning null instead of crashing.
 */
export function PlanBadge({ showIcon = true, className }: PlanBadgeProps) {
  // Use useContext directly to avoid the "Error: useBusiness must be used within a BusinessProvider"
  // which is thrown by the useBusiness hook when context is undefined.
  const context = useContext(BusinessContext);
  
  // If we're outside the provider (context is undefined) or no business is selected, don't render.
  if (!context || !context.currentBusiness) {
    return null;
  }

  const { currentBusiness } = context;
  const plan = currentBusiness.plan_type || 'free'
  const isFree = plan === 'free'
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={
          <Badge 
            variant={isFree ? 'secondary' : 'default'} 
            className={`cursor-default gap-1.5 px-3 py-1 font-bold uppercase tracking-wider text-[10px] ${className}`}
          >
            {showIcon && !isFree && <Sparkles className="h-3 w-3 fill-current" />}
            {isFree ? 'Plano Gratuito' : plan}
          </Badge>
        } />
        <TooltipContent>
          <p className="text-xs">
            {isFree 
              ? 'Você está usando a versão gratuita do Avalia Prudente.' 
              : `Sua empresa está no plano ${plan}.`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
