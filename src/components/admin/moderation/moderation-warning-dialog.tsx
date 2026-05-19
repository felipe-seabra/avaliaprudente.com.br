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
import { AlertTriangle, Loader2, Send } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ModerationWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function ModerationWarningDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess
}: ModerationWarningDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsLoading] = useState(false)
  const [repo] = useState(() => new AdminRepository())

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo do aviso.')
      return
    }

    // Double check to prevent self-warning
    const { data: { user } } = await createClient().auth.getUser()
    if (user?.id === userId) {
      toast.error('Você não pode enviar um aviso para a sua própria conta.')
      return
    }

    setIsLoading(true)
    try {
      await repo.warnUser(userId, reason.trim())
      toast.success('Aviso de moderação enviado com sucesso.')
      setReason('')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to send warning:', err)
      toast.error('Erro ao enviar aviso de moderação.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Enviar Aviso de Moderação</DialogTitle>
          </div>
          <DialogDescription>
            Este aviso será enviado para <strong>{userName}</strong> e ficará registrado permanentemente no histórico de moderação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Motivo do Aviso
            </Label>
            <Textarea
              id="reason"
              placeholder="Ex: Linguagem imprópria em comentário, spam, etc..."
              className="min-h-[100px] resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground italic">
              O usuário receberá uma notificação com este texto.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="warning" 
            className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-none"
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Aviso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
