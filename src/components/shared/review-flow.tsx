'use client'

import React, { useState, useMemo } from 'react'
import { StarRating } from '@/components/shared/star-rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

interface ReviewFlowProps {
  businessId: string
  businessName: string
  googleReviewUrl: string
  onClose?: () => void
}

export function ReviewFlow({ businessId, businessName, googleReviewUrl, onClose }: ReviewFlowProps) {
  const [rating, setRating] = useState(0)
  const [step, setStep] = useState<'rating' | 'feedback' | 'success'>('rating')
  const [isSubmitting, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  
  const repository = useMemo(() => new ReviewRepository(), [])

  const handleRatingSubmit = async (val: number) => {
    setRating(val)
    if (val >= 4) {
      setIsLoading(true)
      try {
        await repository.create({
          business_id: businessId,
          rating: val,
          is_internal: false,
          source: 'nfc-page',
        })
        setStep('success')
        setTimeout(() => {
          window.location.href = googleReviewUrl
        }, 1500)
      } catch {
        toast.error('Erro ao processar avaliação')
      } finally {
        setIsLoading(false)
      }
    } else {
      setStep('feedback')
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await repository.create({
        business_id: businessId,
        rating,
        feedback,
        customer_name: customerName,
        customer_email: customerEmail,
        is_internal: true,
        source: 'nfc-page',
      })
      setStep('success')
    } catch {
      toast.error('Erro ao enviar feedback')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose} className="-ml-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold ml-2">Avaliar {businessName}</h2>
      </div>

      <Card className="glass-effect border-none shadow-lg">
        <CardContent className="pt-8">
          {step === 'rating' && (
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-xl font-semibold text-center">
                Como foi sua experiência?
              </h3>
              <StarRating 
                rating={rating} 
                onRatingChange={handleRatingSubmit} 
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground text-center">
                Selecione de 1 a 5 estrelas
              </p>
            </div>
          )}

          {step === 'feedback' && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Sentimos muito...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Conte-nos o que aconteceu para que possamos melhorar nosso serviço.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback">Sua mensagem</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder="Pode escrever aqui..." 
                    className="min-h-[120px]"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu nome (opcional)</Label>
                    <Input 
                      id="name" 
                      placeholder="João Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Seu e-mail (opcional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="joao@exemplo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar feedback'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setStep('rating')}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Obrigado!</h2>
              <p className="text-muted-foreground max-w-[280px]">
                {rating >= 4 
                  ? 'Redirecionando você para o Google para finalizar sua avaliação...' 
                  : 'Seu feedback foi recebido e será analisado pela nossa equipe.'}
              </p>
              {rating < 4 && (
                <Button variant="outline" className="mt-4" onClick={onClose}>
                  Voltar para a página
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
