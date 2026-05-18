'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShieldAlert, Ban, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { AccountStatus, UserRole } from '@/core/domain/entities'

export function ModerationStatusBadge() {
  const [status, setStatus] = useState<{
    accountStatus: AccountStatus;
    warningCount: number;
    suspendedUntil: string | null;
    role: UserRole | string;
  } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status, warning_count, suspended_until, role')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setStatus({
          accountStatus: (profile.account_status as AccountStatus) || 'active',
          warningCount: profile.warning_count || 0,
          suspendedUntil: profile.suspended_until,
          role: profile.role || 'customer'
        })
      }
    }

    getProfile()
  }, [supabase])

  if (!status || status.role === 'admin') return null

  const isSuspended = status.accountStatus === 'suspended' || 
    (status.suspendedUntil && new Date(status.suspendedUntil) > new Date())
  const isBanned = status.accountStatus === 'banned'
  const hasWarnings = status.warningCount > 0

  if (isBanned) {
    return (
      <Badge variant="destructive" className="gap-1 px-2 py-1 h-7">
        <Ban className="h-3 w-3" />
        Conta Banida
      </Badge>
    )
  }

  if (isSuspended) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="gap-1 px-2 py-1 h-7 bg-orange-600 hover:bg-orange-700">
              <Clock className="h-3 w-3" />
              Conta Suspensa
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sua conta está suspensa temporariamente por violação dos termos.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (hasWarnings) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1 px-2 py-1 h-7 border-orange-500 text-orange-500 bg-orange-500/10">
              <AlertTriangle className="h-3 w-3" />
              {status.warningCount} {status.warningCount === 1 ? 'Aviso' : 'Avisos'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Você possui avisos de moderação. Revise as regras da plataforma.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (status.accountStatus === 'warned') {
    return (
      <Badge variant="secondary" className="gap-1 px-2 py-1 h-7 border-yellow-500 text-yellow-500 bg-yellow-500/10">
        <ShieldAlert className="h-3 w-3" />
        Sob Revisão
      </Badge>
    )
  }

  return null
}
