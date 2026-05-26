'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CreditCard, ShieldAlert, Loader2 } from 'lucide-react'
import { getSubscriptionPlans, adminAssignSubscription } from '@/app/actions/subscriptions'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionStatus } from '@/lib/subscription-config'

interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  features: string[]
  quotas: Record<string, number>
}

interface UserSubscriptionWithPlan {
  id: string
  plan_id: string
  status: SubscriptionStatus
  plan: Plan
}

interface SubscriptionManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function SubscriptionManagementDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: SubscriptionManagementDialogProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSub, setCurrentSub] = useState<UserSubscriptionWithPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus>('active')
  const [reason, setReason] = useState<string>('Ajuste administrativo')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const [availablePlans, subData] = await Promise.all([
        getSubscriptionPlans() as Promise<Plan[]>,
        supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', userId)
          .single()
      ])
      
      setPlans(availablePlans)
      if (subData.data) {
        setCurrentSub(subData.data as unknown as UserSubscriptionWithPlan)
        setSelectedPlanId(subData.data.plan_id)
        setSelectedStatus(subData.data.status as SubscriptionStatus)
      } else if (availablePlans.length > 0) {
        const freePlan = availablePlans.find(p => p.slug === 'free')
        if (freePlan) setSelectedPlanId(freePlan.id)
      }
    } catch (error) {
      console.error('Error loading subscription data', error)
      toast.error('Erro ao carregar dados de assinatura')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  async function handleSubmit() {
    if (!selectedPlanId) return
    setIsSubmitting(true)
    try {
      const result = await adminAssignSubscription(
        userId,
        selectedPlanId,
        selectedStatus,
        reason
      )
      
      if (result.success) {
        toast.success('Assinatura atualizada com sucesso!')
        onSuccess?.()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Falha ao atualizar assinatura')
      }
    } catch {
      toast.error('Erro inesperado ao atualizar assinatura')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Gerenciar Assinatura
          </DialogTitle>
          <DialogDescription>
            Alterar plano e status da assinatura de <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {currentSub && (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase text-primary tracking-widest">Plano Atual</p>
                   <p className="font-bold text-lg">{currentSub.plan?.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-primary tracking-widest">Status</p>
                   <p className="font-bold capitalize">{currentSub.status}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-select">Selecionar Plano</Label>
                <select
                  id="plan-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-select">Status da Assinatura</Label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SubscriptionStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active">Ativa</option>
                  <option value="suspended">Suspensa</option>
                  <option value="expired">Expirada</option>
                  <option value="trial">Trial</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Motivo da Alteração</Label>
                <Input 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Upgrade concedido via suporte"
                />
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-2">
               <ShieldAlert className="h-4 w-4 text-yellow-600 shrink-0" />
               <p className="text-[10px] text-yellow-700 font-medium">
                 Esta alteração será registrada nos logs de auditoria e terá efeito imediato nos direitos (entitlements) do usuário.
               </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading} className="gap-2 font-bold">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
