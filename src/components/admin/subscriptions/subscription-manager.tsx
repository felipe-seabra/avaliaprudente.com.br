'use client'

import { useState } from 'react'
import { adminAssignSubscription } from '@/app/actions/subscriptions'
import { SubscriptionStatus } from '@/lib/subscriptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Plan {
  id: string
  slug: string
  name: string
}

interface SubscriptionManagerProps {
  userId: string
  currentPlanId?: string
  currentStatus?: SubscriptionStatus
  plans: Plan[]
}

export function SubscriptionManager({
  userId,
  currentPlanId,
  currentStatus,
  plans,
}: SubscriptionManagerProps) {
  const [planId, setPlanId] = useState(currentPlanId || '')
  const [status, setStatus] = useState<SubscriptionStatus>(currentStatus || 'active')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    if (!planId) {
      toast.error('Selecione um plano.')
      return
    }

    setIsLoading(true)
    try {
      const result = await adminAssignSubscription(userId, planId, status, reason)
      if (result.success) {
        toast.success('Assinatura atualizada com sucesso.')
      } else {
        toast.error(result.error || 'Falha ao atualizar assinatura.')
      }
    } catch {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Assinatura</CardTitle>
        <CardDescription>
          Alterar plano e status de acesso do usuário manualmente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="plan">Plano</Label>
          <select
            id="plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Selecione um plano</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.slug})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="active">Ativo</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspenso</option>
            <option value="expired">Expirado</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reason">Motivo da Alteração</Label>
          <Input
            id="reason"
            placeholder="Ex: Upgrade manual cortesia"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleUpdate} 
          disabled={isLoading || !planId}
        >
          {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
