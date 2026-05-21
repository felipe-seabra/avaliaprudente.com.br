'use client'

import React, { useContext, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BusinessContext } from '@/providers/business-provider'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'
import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'

interface PlanBadgeProps {
  showIcon?: boolean
  showUpgradeAction?: boolean
  className?: string
}

/**
 * PlanBadge component that safely renders the business plan status.
 * Admins are automatically shown as 'Business Plan' to reflect their operator status.
 */
export function PlanBadge({ 
  showIcon = true, 
  showUpgradeAction = true,
  className 
}: PlanBadgeProps) {
  const context = useContext(BusinessContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (checkIsAdmin(profile?.role)) {
          setIsAdmin(true);
        }
      }
    }
    checkRole();
  }, [supabase]);
  
  // If we're outside the provider (context is undefined) or no business is selected, 
  // we only show something if we are an admin (general platform context).
  if (!context || !context.currentBusiness) {
    if (isAdmin) {
      return (
        <Badge variant="default" className={`cursor-default gap-1.5 px-3 py-1 font-bold uppercase tracking-wider text-[10px] bg-primary/10 text-primary border-primary/20 ${className}`}>
           <ShieldCheck className="h-3 w-3 fill-current" />
           Plano Business
        </Badge>
      );
    }
    return null;
  }

  const { currentBusiness } = context;
  const plan = currentBusiness.plan_type || 'free'
  const isFree = plan === 'free' && !isAdmin;
  
  const label = isAdmin ? 'Plano Business' : (isFree ? 'Plano Gratuito' : plan);
  const variant = isFree ? 'secondary' : 'default';
  
  return (
    <div className="flex items-center gap-3">
      {isFree && showUpgradeAction && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 px-3 text-[10px] font-bold gap-1.5 opacity-60 cursor-not-allowed border-dashed"
                disabled
              >
                <Zap className="h-3.5 w-3.5 fill-primary text-primary" />
                Fazer Upgrade
              </Button>
            } />
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">Planos Pro & Enterprise em breve!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={
            <Badge 
              variant={variant} 
              className={`cursor-default gap-1.5 px-3 py-1 font-bold uppercase tracking-wider text-[10px] ${isAdmin ? 'bg-primary/10 text-primary border-primary/20' : ''} ${className}`}
            >
              {showIcon && isAdmin && <ShieldCheck className="h-3 w-3 fill-current" />}
              {showIcon && !isAdmin && !isFree && <Sparkles className="h-3 w-3 fill-current" />}
              {label}
            </Badge>
          } />
          <TooltipContent>
            <p className="text-xs">
              {isAdmin 
                ? 'Você tem acesso total como administrador da plataforma.' 
                : isFree 
                  ? 'Você está usando a versão gratuita do Avalia Prudente.' 
                  : `Sua empresa está no plano ${plan}.`
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
