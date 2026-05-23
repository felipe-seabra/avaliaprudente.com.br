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
import { Snowflake, Loader2, Lock } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { revalidateBusiness } from '@/app/actions/cache'

interface ModerationFreezeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessId: string
  businessName: string
  businessSlug?: string
  onSuccess?: () => void
}

export function ModerationFreezeDialog({
  open,
  onOpenChange,
  businessId,
  businessName,
  businessSlug,
  onSuccess
}: ModerationFreezeDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsLoading] = useState(false)
  const [repo] = useState(() => new AdminRepository())

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo do congelamento.')
      return
    }

    setIsLoading(true)
    try {
      await repo.freezeBusiness(businessId, reason.trim())
      toast.success('Empresa congelada com sucesso.')
      
      // Cache Invalidation
      if (businessSlug) {
        await revalidateBusiness(businessSlug)
      }

      setReason('')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to freeze business:', err)
      toast.error('Erro ao congelar empresa.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Snowflake className="h-5 w-5 text-blue-400" />
            <DialogTitle>Congelar Empresa</DialogTitle>
          </div>
          <DialogDescription>
            Congelar a empresa <strong>{businessName}</strong>. A página pública continuará visível, mas o proprietário não poderá editá-la e novos reviews serão bloqueados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
              Motivo do Congelamento
            </Label>
            <Textarea
              id="reason"
              placeholder="Ex: Dados fraudulentos, denúncias recorrentes..."
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
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Congelar Agora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
