'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useReviewLink } from '@/hooks/use-review-link'
import { StarRating } from '@/components/shared/star-rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export default function PublicReviewPage() {
  const { slug } = useParams()
  const { link, isLoading, error } = useReviewLink(slug as string)
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
      // Direct redirect flow
      setIsLoading(true)
      try {
        await repository.create({
          business_id: link!.business_id,
          rating: val,
          is_internal: false,
          source: 'qr-code',
        })
        setStep('success')
        setTimeout(() => {
          window.location.href = link!.redirect_url
        }, 1500)
      } catch {
        toast.error('Erro ao processar avaliação')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Feedback internal flow
      setStep('feedback')
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await repository.create({
        business_id: link!.business_id,
        rating,
        feedback,
        customer_name: customerName,
        customer_email: customerEmail,
        is_internal: true,
        source: 'qr-code',
      })
      setStep('success')
    } catch {
      toast.error('Erro ao enviar feedback')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Oops!</h1>
        <p className="text-muted-foreground mt-2">{error || 'Link de avaliação inválido'}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <div className="w-full max-w-[500px]">
        <div className="flex flex-col items-center mb-8 text-center">
          {link.businesses.logo_url ? (
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 mb-4 bg-background">
              <Image 
                src={link.businesses.logo_url} 
                alt={link.businesses.name} 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20">
              <span className="text-2xl font-bold text-primary">
                {link.businesses.name.substring(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold">{link.businesses.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Valorizamos muito a sua opinião!</p>
        </div>

        <Card className="glass-effect border-none shadow-xl">
          <CardContent className="pt-8">
            {step === 'rating' && (
              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-xl font-semibold text-center">
                  Como foi sua experiência?
                </h2>
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
                  <h2 className="text-xl font-semibold">
                    Sentimos muito...
                  </h2>
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
                  <Button variant="outline" className="mt-4" onClick={() => window.close()}>
                    Fechar
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            Desenvolvido por <span className="font-semibold text-primary">Avalia Prudente</span>
          </p>
        </div>
      </div>
    </div>
  )
}
