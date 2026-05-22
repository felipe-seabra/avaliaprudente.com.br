"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from '@/components/ui/tooltip'
import { getReputationBadge } from '@/lib/reputation'
import { cn } from '@/lib/utils'
import { ShieldCheck, Award, Star, Medal, Zap, Crown } from 'lucide-react'

interface ReputationBadgeProps {
  count: number
  role?: string
  showTooltip?: boolean
  className?: string
}

const getBadgeIcon = (level: string) => {
  switch (level) {
    case 'team': return <ShieldCheck className="h-3 w-3 mr-1" />
    case 'reference': return <Crown className="h-3 w-3 mr-1" />
    case 'elite': return <Award className="h-3 w-3 mr-1" />
    case 'specialist': return <Star className="h-3 w-3 mr-1" />
    case 'active': return <Medal className="h-3 w-3 mr-1" />
    case 'recurrent': return <Zap className="h-3 w-3 mr-1" />
    default: return null
  }
}

export function ReputationBadge({ 
  count, 
  role, 
  showTooltip = true,
  className 
}: ReputationBadgeProps) {
  const badge = getReputationBadge(count, role)

  if (!badge) return null

  const badgeContent = (
    <Badge 
      variant={badge.variant === 'premium' ? 'default' : badge.variant} 
      className={cn(
        "cursor-default transition-all duration-300 hover:scale-105 select-none text-[10px] py-0 h-5 px-2",
        badge.className,
        className
      )}
    >
      {getBadgeIcon(badge.level)}
      {badge.label}
    </Badge>
  )

  if (!showTooltip) return badgeContent

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger render={badgeContent} />
        <TooltipContent side="top" className="text-[11px] px-3 py-1.5 font-medium">
          {badge.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
