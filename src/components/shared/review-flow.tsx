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
import { CheckCircle2, ChevronLeft, Send } from 'lucide-react'

interface ReviewFlowProps {
  businessId: string
  businessName: string
  googleReviewUrl: string
  onClose?: () => void
}

export function ReviewFlow({ businessId, businessName, googleReviewUrl, onClose }: ReviewFlowProps) {
  const [rating, setRating] = useState(0)
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating')
  const [isSubmitting, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  
  const repository = useMemo(() => new ReviewRepository(), [])

  const handleRatingSelect = (val: number) => {
    setRating(val)
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setIsLoading(true)
    try {
      const isInternal = rating < 4

      await repository.create({
        business_id: businessId,
        rating,
        feedback: feedback.trim(),
        customer_name: customerName.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        is_internal: isInternal,
        source: 'nfc-page',
      })

      setStep('success')

      // If positive rating, redirect after showing success
      if (!isInternal) {
        setTimeout(() => {
          window.location.href = googleReviewUrl
        }, 2000)
      }
    } catch (err: unknown) {
      console.error('Review submission error:', err)
      toast.error('Não foi possível enviar sua avaliação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="-ml-2 cursor-pointer"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold ml-2">Avaliar {businessName}</h2>
      </div>

      <Card className="glass-effect border-none shadow-xl rounded-[2rem] overflow-hidden">
        <CardContent className="pt-8 px-6 pb-8">
          {step === 'rating' && (
            <div className="flex flex-col items-center space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">
                  Como foi sua experiência?
                </h3>
                <p className="text-muted-foreground">
                  Sua opinião ajuda a melhorar nossos serviços.
                </p>
              </div>
              
              <div className="scale-110">
                <StarRating 
                  rating={rating} 
                  onRatingChange={handleRatingSelect} 
                  disabled={isSubmitting}
                />
              </div>
              
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                Selecione de 1 a 5 estrelas
              </p>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center space-y-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="transition-transform active:scale-90"
                    >
                      <CheckCircle2 
                        className={`h-6 w-6 ${i < rating ? 'text-primary fill-primary/20' : 'text-muted opacity-30'}`} 
                      />
                    </button>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep('rating')}
                  className="text-[10px] uppercase font-bold text-primary hover:underline"
                >
                  Alterar nota
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-sm font-bold">Sua mensagem</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder={rating >= 4 ? "O que você mais gostou?" : "O que podemos melhorar?"}
                    className="min-h-[120px] bg-muted/20 border-none rounded-2xl resize-none focus:ring-2 focus:ring-primary/20"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required={rating < 4}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Seu nome (opcional)</Label>
                    <Input 
                      id="name" 
                      placeholder="Ex: João Silva"
                      className="bg-muted/20 border-none h-12 rounded-xl"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  {rating < 4 && (
                    <div className="space-y-2 animate-in fade-in duration-500">
                      <Label htmlFor="email" className="text-sm font-bold">Seu e-mail (opcional)</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Ex: joao@exemplo.com"
                        className="bg-muted/20 border-none h-12 rounded-xl"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Usaremos seu e-mail apenas para entrar em contato sobre seu feedback.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base rounded-2xl gap-2 shadow-lg shadow-primary/20 cursor-pointer" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full cursor-pointer" 
                  onClick={() => setStep('rating')}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Avaliação Enviada!</h2>
                <p className="text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
                  {rating >= 4 
                    ? 'Muito obrigado! Estamos te redirecionando para o Google para concluir sua recomendação pública.' 
                    : 'Agradecemos o seu feedback sincero. Ele foi enviado diretamente aos responsáveis para melhorarmos nosso serviço.'}
                </p>
              </div>
              {rating < 4 && (
                <Button variant="outline" className="mt-4 h-12 px-8 rounded-xl cursor-pointer" onClick={onClose}>
                  Voltar para o início
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
