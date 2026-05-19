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
import { ShieldCheck, Loader2, Clock, CheckCircle2, AlertCircle, Link, MessageSquare } from 'lucide-react'
import { VerificationRepository, VerificationRequest } from '@/core/infrastructure/repositories/supabase-verification-repository'
import { PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

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
  
  // Eligibility state
  const [hasPageLinks, setHasPageLinks] = useState(false)
  const [hasReviewLink, setHasReviewLink] = useState(false)
  
  // Repositories
  const [repo] = useState(() => new VerificationRepository())
  const [pageRepo] = useState(() => new PageLinkRepository())
  const [reviewRepo] = useState(() => new ReviewLinkRepository())

  const checkEligibility = useCallback(async () => {
    setIsChecking(true)
    try {
      // 1. Check pending requests
      const requests = await repo.getByBusinessId(businessId)
      const pending = requests.find(r => r.status === 'pending')
      setPendingRequest(pending || null)

      // 2. Check page links (Social/Business links)
      // We need the page ID first. Since we don't have it easily here, 
      // let's use a simpler way if possible, or fetch the page first.
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: page } = await supabase.from('business_pages').select('id').eq('business_id', businessId).maybeSingle()
      
      if (page) {
        const pLinks = await pageRepo.getByPageId(page.id)
        setHasPageLinks(pLinks.length > 0)
      } else {
        setHasPageLinks(false)
      }

      // 3. Check review links (Google link)
      const rLinks = await reviewRepo.getByBusinessId(businessId)
      setHasReviewLink(rLinks.length > 0)

    } catch (err) {
      console.error('Failed to check eligibility', err)
    } finally {
      setIsChecking(false)
    }
  }, [businessId, repo, pageRepo, reviewRepo])

  useEffect(() => {
    if (open && businessId) {
      checkEligibility()
    }
  }, [open, businessId, checkEligibility])

  const isEligible = hasPageLinks && hasReviewLink

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
              <div className="p-4 bg-muted/50 rounded-xl space-y-3 border border-border/50">
                 <p className="text-sm font-bold flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-primary" /> Requisitos para Verificação
                 </p>
                 
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs">
                          <Link className={cn("h-3.5 w-3.5", hasPageLinks ? "text-green-500" : "text-muted-foreground")} />
                          <span className={cn(hasPageLinks ? "text-foreground font-medium" : "text-muted-foreground")}>
                            Mínimo de 1 link social/externo
                          </span>
                       </div>
                       {hasPageLinks ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                       )}
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs">
                          <MessageSquare className={cn("h-3.5 w-3.5", hasReviewLink ? "text-green-500" : "text-muted-foreground")} />
                          <span className={cn(hasReviewLink ? "text-foreground font-medium" : "text-muted-foreground")}>
                            Link de Avaliação Google configurado
                          </span>
                       </div>
                       {hasReviewLink ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                       ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
                       )}
                    </div>
                 </div>

                 {!isEligible && (
                    <div className="mt-3 p-2 bg-destructive/5 rounded-lg border border-destructive/10 flex gap-2">
                       <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                       <p className="text-[10px] text-destructive leading-tight">
                         Sua empresa ainda não atende aos requisitos mínimos para verificação. Complete seu perfil para continuar.
                       </p>
                    </div>
                 )}
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
                  disabled={isLoading || !isEligible}
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
                disabled={isLoading || isChecking || !isEligible}
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
