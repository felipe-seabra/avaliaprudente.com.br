'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { ShieldCheck, Loader2, Clock, CheckCircle2 } from 'lucide-react'
import { VerificationRepository, VerificationRequest } from '@/core/infrastructure/repositories/supabase-verification-repository'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface VerificationRequestModalProps {
  businessId: string
  businessName: string
  isVerified: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerificationRequestModal({ 
  businessId, 
  businessName, 
  isVerified,
  open, 
  onOpenChange 
}: VerificationRequestModalProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [pendingRequest, setPendingRequest] = useState<VerificationRequest | null>(null)
  
  // Memoize repo
  const [repo] = useState(() => new VerificationRepository())

  const checkPendingRequest = useCallback(async () => {
    setIsChecking(true)
    try {
      const requests = await repo.getByBusinessId(businessId)
      const pending = requests.find(r => r.status === 'pending')
      setPendingRequest(pending || null)
    } catch (err) {
      console.error('Failed to check pending requests', err)
    } finally {
      setIsChecking(false)
    }
  }, [businessId, repo])

  useEffect(() => {
    if (open && businessId) {
      checkPendingRequest()
    }
  }, [open, businessId, checkPendingRequest])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await repo.create(businessId, message)
      toast.success('Solicitação enviada!', {
        description: 'Nossa equipe irá analisar seu pedido em breve.'
      })
      onOpenChange(false)
      setMessage('')
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Erro ao enviar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" /> Empresa Verificada
            </DialogTitle>
            <DialogDescription>
              {businessName} já possui o selo de verificação oficial.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
             <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-blue-600" />
             </div>
             <p className="text-sm text-muted-foreground">
               Sua empresa já desfruta de todos os benefícios da verificação oficial.
             </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full cursor-pointer">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> 
            Solicitar Verificação
          </DialogTitle>
          <DialogDescription>
            Obtenha o selo oficial de confiança para <strong>{businessName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
             <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
             <p className="text-sm text-muted-foreground">Verificando status...</p>
          </div>
        ) : pendingRequest ? (
          <div className="space-y-6 py-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 font-bold">Pedido em Análise</AlertTitle>
              <AlertDescription className="text-blue-700">
                Já existe uma solicitação de verificação pendente para esta empresa.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
               <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Sua mensagem:</p>
               <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground italic">
                  &quot;{pendingRequest.message || 'Sem mensagem adicional.'}&quot;
               </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Aguarde o retorno da nossa equipe. Você receberá uma notificação assim que o pedido for processado.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full cursor-pointer">
                Entendi
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl space-y-2 border border-border/50">
                 <p className="text-sm font-bold flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-primary" /> Por que verificar?
                 </p>
                 <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                   <li>Maior credibilidade para seus clientes</li>
                   <li>Destaque visual no ranking da cidade</li>
                   <li>Prioridade em resultados de busca internos</li>
                 </ul>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mensagem para a moderação (opcional)
                </label>
                <Textarea 
                  placeholder="Conte-nos por que sua empresa deve ser verificada ou anexe links que comprovem a autenticidade."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none h-24"
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || isChecking}
                className="gap-2 font-bold cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
