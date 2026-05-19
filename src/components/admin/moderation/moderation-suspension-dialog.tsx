'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Ban, ShieldAlert } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ModerationSuspensionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function ModerationSuspensionDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess
}: ModerationSuspensionDialogProps) {
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('15')
  const [isSubmitting, setIsLoading] = useState(false)
  const [repo] = useState(() => new AdminRepository())

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo da suspensão.')
      return
    }

    // Double check to prevent self-suspension
    const { data: { user } } = await createClient().auth.getUser()
    if (user?.id === userId) {
      toast.error('Você não pode suspender a sua própria conta.')
      return
    }

    setIsLoading(true)
    try {
      await repo.suspendUser(userId, reason.trim(), parseInt(days))
      toast.success('Usuário suspenso com sucesso.')
      setReason('')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to suspend user:', err)
      toast.error('Erro ao suspender usuário.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <ShieldAlert className="h-5 w-5" />
            <DialogTitle>Suspender Conta</DialogTitle>
          </div>
          <DialogDescription>
            Suspender a conta de <strong>{userName}</strong>. O usuário perderá acesso ao painel e suas empresas serão congeladas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="days" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Duração da Suspensão
            </Label>
            <select 
              id="days"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            >
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Motivo da Suspensão
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da punição..."
              className="min-h-[100px] resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            className="gap-2"
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Ban className="h-4 w-4" />
                Confirmar Suspensão
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
