'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AppealDialogProps {
  actionId: string
  actionType: string
  reason: string
  onSuccess?: () => void
}

export function AppealDialog({ actionId, actionType, reason, onSuccess }: AppealDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor, descreva sua justificativa.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('moderation_appeals' as any) as any)
        .insert({
          moderation_action_id: actionId,
          user_id: user.id,
          message: message.trim(),
          status: 'pending'
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('Você já enviou uma apelação para esta ação.')
        } else {
          throw error
        }
        return
      }

      toast.success('Apelação enviada com sucesso!', {
        description: 'Nossa equipe revisará seu caso em breve.'
      })
      setIsOpen(false)
      setMessage('')
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Error submitting appeal:', error)
      const errMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao enviar apelação', {
        description: errMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'warning': return 'Aviso'
      case 'suspension': return 'Suspensão'
      case 'ban': return 'Banimento'
      default: return type
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10">
          <MessageSquare className="h-3 w-3" /> Contestar
        </Button>
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" /> Contestar Moderação
          </DialogTitle>
          <DialogDescription>
            Você está contestando a ação de <strong>{getActionLabel(actionType)}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1">Motivo original:</p>
            <p>{reason}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold">Sua justificativa:</label>
            <Textarea 
              placeholder="Explique por que você acredita que esta ação foi equivocada..."
              className="min-h-[120px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-[10px] text-muted-foreground">
              Seja claro e objetivo. Ofensas ou comportamento inadequado resultarão na rejeição imediata da apelação.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 font-bold">
            {isSubmitting ? 'Enviando...' : 'Enviar Apelação'}
            {!isSubmitting && <Send className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
