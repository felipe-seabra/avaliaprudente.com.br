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

interface ModerationBanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function ModerationBanDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess
}: ModerationBanDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsLoading] = useState(false)
  const [repo] = useState(() => new AdminRepository())

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo do banimento.')
      return
    }

    // Double check to prevent self-ban
    const { data: { user } } = await createClient().auth.getUser()
    if (user?.id === userId) {
      toast.error('Você não pode banir a sua própria conta.')
      return
    }

    setIsLoading(true)
    try {
      await repo.banUser(userId, reason.trim())
      toast.success('Usuário banido permanentemente.')
      setReason('')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to ban user:', err)
      toast.error('Erro ao banir usuário.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-destructive/20">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <Ban className="h-5 w-5" />
            <DialogTitle>Banimento Permanente</DialogTitle>
          </div>
          <DialogDescription className="text-destructive font-medium">
            Esta ação é irreversível. O usuário <strong>{userName}</strong> perderá o acesso permanentemente e todas as suas empresas serão congeladas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Motivo do Banimento Permanente
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva detalhadamente o motivo deste banimento permanente..."
              className="min-h-[120px] resize-none border-destructive/20 focus-visible:ring-destructive"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="bg-destructive/5 -mx-6 -mb-6 p-4 mt-2 border-t border-destructive/10">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            className="gap-2 font-bold"
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                Confirmar Banimento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
