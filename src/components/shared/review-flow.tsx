'use client'

import React, { useEffect, useState } from 'react'
import { StarRating } from '@/components/shared/star-rating'
import { BrandIcons } from '@/components/shared/brand-icons'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft, Loader2, Mail, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { getBrowserFingerprint } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { APP_CONFIG } from '@/lib/constants'

interface ReviewFlowProps {
  businessId: string
  businessName: string
  googleReviewUrl: string
  onClose?: () => void
}

function getInitialDisplayName(user: User | null) {
  const metadata = user?.user_metadata || {}
  const name = metadata.full_name || metadata.name || metadata.display_name

  return typeof name === 'string' ? name : ''
}

export function ReviewFlow({ businessId, businessName, googleReviewUrl, onClose }: ReviewFlowProps) {
  const [rating, setRating] = useState(0)
  const [step, setStep] = useState<'rating' | 'auth' | 'details' | 'success'>('rating')
  const [isSubmitting, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [feedback, setFeedback] = useState('')
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setDisplayName((current) => current || getInitialDisplayName(data.user))
      if (data.user && step === 'auth' && rating > 0) {
        setStep('details')
      }
      setIsCheckingAuth(false)
    }

    loadUser()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setDisplayName((current) => current || getInitialDisplayName(session?.user || null))
      if (session?.user && step === 'auth' && rating > 0) {
        setStep('details')
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [rating, step])

  const getRedirectUrl = () => {
    // Construct the absolute callback URL using the canonical APP_CONFIG.url
    // instead of window.location.origin to ensure consistent session handling
    const callbackUrl = new URL('/auth/callback', APP_CONFIG.url)
    
    // Ensure we preserve the current path and the review=1 state
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set('review', '1')
    const nextPath = `${nextUrl.pathname}${nextUrl.search}`
    
    callbackUrl.searchParams.set('next', nextPath)
    
    return callbackUrl.toString()
  }
  
  const handleRatingSelect = (val: number) => {
    setRating(val)
    setStep(user ? 'details' : 'auth')
  }

  const handleGoogleAuth = async () => {
    setIsAuthLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      toast.error('Não foi possível iniciar o login com Google.')
      setIsAuthLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!magicEmail.trim()) {
      toast.error('Informe seu e-mail para receber o link de acesso.')
      return
    }

    setIsAuthLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail.trim(),
      options: {
        emailRedirectTo: getRedirectUrl(),
        shouldCreateUser: true, // Explicitly allow user creation for passwordless login
      },
    })

    if (error) {
      toast.error('Não foi possível enviar o Magic Link.')
      setIsAuthLoading(false)
      return
    }

    setMagicSent(true)
    setIsAuthLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas.')
      return
    }

    if (!user) {
      setStep('auth')
      return
    }

    const publicName = displayName.trim()
    if (!publicName) {
      toast.error('Informe o nome que será exibido junto da sua avaliação.')
      return
    }

    setIsLoading(true)
    try {
      const isInternal = rating < 4
      const fingerprint = await getBrowserFingerprint()

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          rating,
          feedback: feedback.trim() || undefined,
          display_name: publicName,
          is_internal: isInternal,
          source: 'nfc-page',
          browser_fingerprint: fingerprint,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar avaliação')
      }

      setStep('success')

      // If positive rating, redirect after showing success
      if (!isInternal) {
        setTimeout(() => {
          window.location.href = googleReviewUrl
        }, 2500)
      }
    } catch (err: unknown) {
      console.error('Review submission error:', err)
      
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível enviar sua avaliação. Tente novamente.'
      toast.error(errorMessage)
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
          className="-ml-2 cursor-pointer transition-transform hover:scale-110 active:scale-90"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold ml-2">Avaliar {businessName}</h2>
      </div>

      <Card className="glass-effect border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="pt-8 px-6 pb-8">
          {step === 'rating' && (
            <div className="flex flex-col items-center space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
                   <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Como foi sua experiência?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sua opinião é fundamental para nós.
                </p>
              </div>
              
              <div className="scale-125 py-4">
                <StarRating 
                  rating={rating} 
                  onRatingChange={handleRatingSelect} 
                  disabled={isSubmitting}
                />
              </div>
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                Toque em uma estrela para continuar
              </p>
            </div>
          )}

          {step === 'auth' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Entre para continuar
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sua avaliação será vinculada à sua conta, mas apenas seu nome público aparecerá.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-2xl gap-3 text-base font-bold"
                onClick={handleGoogleAuth}
                disabled={isAuthLoading || isCheckingAuth}
              >
                {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrandIcons.Google size={20} />}
                Continuar com Google
              </Button>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <Label htmlFor="magic-email" className="text-sm font-bold">
                  Acesso por Magic Link
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12 rounded-xl bg-muted/20 border-none"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    disabled={isAuthLoading || magicSent}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-12 rounded-xl gap-2 font-bold sm:w-40"
                    disabled={isAuthLoading || magicSent}
                  >
                    <Mail className="h-4 w-4" />
                    Enviar
                  </Button>
                </div>
                {magicSent && (
                  <p className="text-xs text-green-600">
                    Link enviado. Abra seu e-mail neste dispositivo para continuar a avaliação.
                  </p>
                )}
              </form>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Coletamos somente os dados necessários para autenticar sua autoria, prevenir abuso e permitir moderação. Seu e-mail não será exibido publicamente.
              </p>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center space-y-2 mb-4 bg-muted/30 p-4 rounded-2xl">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="transition-transform active:scale-90"
                    >
                      <Sparkles 
                        className={`h-5 w-5 ${i < rating ? 'text-primary fill-primary/20' : 'text-muted opacity-30'}`} 
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="feedback" className="text-sm font-bold">Mensagem (opcional)</Label>
                  </div>
                  <Textarea 
                    id="feedback" 
                    placeholder={rating >= 4 ? "Conte o que você mais gostou..." : "O que podemos fazer melhor?"}
                    className="min-h-[120px] bg-muted/20 border-none rounded-2xl resize-none focus:ring-2 focus:ring-primary/20 p-4 text-base"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-sm font-bold">Nome público</Label>
                    <Input 
                      id="display-name"
                      placeholder="Ex: João Silva"
                      className="bg-muted/20 border-none h-12 rounded-xl px-4"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Este é o único dado de identidade exibido junto da sua avaliação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base rounded-2xl gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-95 transition-transform" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Concluir Avaliação
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full cursor-pointer opacity-70 hover:opacity-100" 
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
              <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-2 shadow-inner border border-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sucesso!</h2>
                <p className="text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
                  {rating >= 4 
                    ? 'Recebemos sua nota! Agora estamos te levando para o Google para finalizar sua recomendação pública.' 
                    : 'Agradecemos sua sinceridade! Seu feedback foi enviado diretamente à gerência para análise imediata.'}
                </p>
              </div>
              {rating < 4 && (
                <Button variant="outline" className="mt-4 h-12 px-8 rounded-xl cursor-pointer hover:bg-muted" onClick={onClose}>
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
