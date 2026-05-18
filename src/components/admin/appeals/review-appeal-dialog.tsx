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
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ReviewAppealDialogProps {
  appealId: string
  userName: string
  reason: string
  userMessage: string
  onSuccess?: () => void
}

export function ReviewAppealDialog({ appealId, userName, reason, userMessage, onSuccess }: ReviewAppealDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null)
  const supabase = createClient()

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!adminResponse.trim()) {
      toast.error('Por favor, adicione uma resposta para o usuário.')
      return
    }

    setIsSubmitting(true)
    setActionType(status)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('moderation_appeals' as any) as any)
        .update({
          status,
          admin_response: adminResponse.trim(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', appealId)

      if (error) throw error

      toast.success(status === 'approved' ? 'Apelação aprovada!' : 'Apelação rejeitada', {
        description: status === 'approved' ? 'As sanções foram revertidas.' : 'O usuário foi notificado.'
      })
      
      setIsOpen(false)
      setAdminResponse('')
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Error reviewing appeal:', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao processar revisão', {
        description: message
      })
    } finally {
      setIsSubmitting(false)
      setActionType(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="h-8 font-bold">
          Revisar
        </Button>
      } />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisar Apelação</DialogTitle>
          <DialogDescription>
            Analisando pedido de contestação de <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1 text-[10px]">Motivo Original:</p>
              <p className="italic">&quot;{reason}&quot;</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg text-sm border border-primary/10">
              <p className="font-bold text-xs uppercase tracking-widest text-primary mb-1 text-[10px]">Justificativa do Usuário:</p>
              <p>&quot;{userMessage}&quot;</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold">Resposta da Moderação (enviada ao usuário):</label>
            <Textarea 
              placeholder="Explique a decisão tomada após a revisão..."
              className="min-h-[100px] resize-none"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleReview('rejected')} 
              disabled={isSubmitting}
              className="gap-2 font-bold"
            >
              {isSubmitting && actionType === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Rejeitar
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleReview('approved')} 
              disabled={isSubmitting}
              className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting && actionType === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Aprovar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
