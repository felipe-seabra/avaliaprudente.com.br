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
import { Loader2, UserX, AlertCircle } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ModerationDeactivationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function ModerationDeactivationDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess
}: ModerationDeactivationDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsLoading] = useState(false)
  const [repo] = useState(() => new AdminRepository())

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo da desativação.')
      return
    }

    // Double check to prevent self-deactivation
    const { data: { user } } = await createClient().auth.getUser()
    if (user?.id === userId) {
      toast.error('Você não pode desativar a sua própria conta.')
      return
    }

    setIsLoading(true)
    try {
      await repo.deactivateUser(userId, reason.trim())
      toast.success('Conta desativada com sucesso.')
      setReason('')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to deactivate user:', err)
      toast.error('Erro ao desativar conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <UserX className="h-5 w-5" />
            <DialogTitle>Desativar Conta</DialogTitle>
          </div>
          <DialogDescription>
            Você está prestes a desativar a conta de <strong>{userName}</strong>.
            O usuário perderá o acesso imediatamente e todas as suas empresas serão congeladas. 
            Esta é uma desativação segura (soft delete).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg border border-border flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              A conta não será excluída permanentemente do banco de dados para preservar o histórico de moderação e integridade, mas o usuário não poderá mais realizar login.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Motivo da Desativação
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo para desativar esta conta..."
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
                <UserX className="h-4 w-4" />
                Desativar Conta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
