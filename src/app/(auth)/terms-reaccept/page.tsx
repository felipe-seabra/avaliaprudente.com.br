'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/lib/constants'

export default function TermsReacceptPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted_at: new Date().toISOString(),
          terms_version: APP_CONFIG.currentTermsVersion
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Termos aceitos!', {
        description: 'Você já pode continuar usando a plataforma.'
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error accepting terms:', error)
      const message = error instanceof Error ? error.message : 'Tente novamente em instantes.'
      toast.error('Erro ao aceitar termos', {
        description: message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">Atualizamos nossos Termos</CardTitle>
          <CardDescription className="text-base mt-2">
            Para continuar utilizando o Avalia Prudente, você precisa aceitar a nova versão dos nossos Termos de Uso (v{APP_CONFIG.currentTermsVersion}).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-6 space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">O que mudou?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Novas diretrizes de transparência em moderação.</li>
              <li>Regras mais claras sobre comportamento e fraudes.</li>
              <li>Melhor detalhamento sobre suspensões e banimentos.</li>
            </ul>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Recomendamos que você leia os termos completos antes de prosseguir.
          </p>
          <Link href="/terms" target="_blank" className="flex items-center justify-center gap-2 text-primary hover:underline font-medium text-sm">
            Ler Termos de Uso completos <ExternalLink className="h-3 w-3" />
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 pt-6">
          <Button 
            className="w-full font-bold gap-2 py-6 text-lg" 
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Aceitar e Continuar'}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            Avalia Prudente &copy; 2026
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
