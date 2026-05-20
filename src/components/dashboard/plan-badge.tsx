'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useBusiness } from '@/providers/business-provider'
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

export function PlanBadge({ showIcon = true, className }: PlanBadgeProps) {
  const { currentBusiness } = useBusiness()
  
  const plan = currentBusiness?.plan_type || 'free'
  
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
