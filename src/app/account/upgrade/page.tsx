'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  QrCode,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function UpgradePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleUpgrade = async () => {
    if (!acceptedTerms) {
      toast.error('Você precisa aceitar os termos de uso empresarial.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar conta')
      }

      toast.success('Parabéns! Sua conta agora é Empresarial.')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Upgrade Error:', err)
      const message = err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar sua conta.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      title: 'Gerencie sua Empresa',
      description: 'Crie uma página pública personalizada para seu negócio.',
      icon: Building2
    },
    {
      title: 'Analytics Avançado',
      description: 'Acompanhe o desempenho e feedback dos seus clientes.',
      icon: BarChart3
    },
    {
      title: 'QR Codes & NFC',
      description: 'Gere links inteligentes para facilitar avaliações no local.',
      icon: QrCode
    },
    {
      title: 'Segurança & Controle',
      description: 'Moderação de comentários e gestão de reputação.',
      icon: ShieldCheck
    }
  ]

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Leve seu negócio para o próximo nível
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transforme sua conta de avaliador em uma conta empresarial e comece a gerenciar a reputação do seu negócio hoje mesmo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">O que você ganha:</h2>
          <div className="grid gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Card className="border-primary/20 shadow-xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-primary/5 pb-8">
              <CardTitle className="text-2xl">Upgrade Gratuito</CardTitle>
              <CardDescription>
                Comece com nosso plano gratuito e escale conforme cresce.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">1 Empresa inclusa no plano Free</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Página de avaliações personalizada</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Suporte básico via central</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label 
                    htmlFor="terms" 
                    className="text-sm leading-snug text-muted-foreground cursor-pointer"
                  >
                    Eu aceito os termos de uso empresarial e entendo que serei migrado para o ambiente de gestão do Avalia Prudente.
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-8">
              <Button 
                className="w-full h-12 text-lg font-bold rounded-2xl group" 
                onClick={handleUpgrade}
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    Ativar Conta Empresarial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="bg-muted/30 rounded-3xl p-8 border border-border/50">
        <h3 className="text-lg font-bold mb-4">Perguntas Frequentes</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Vou perder minhas avaliações?</h4>
            <p className="text-sm text-muted-foreground">Não. Todas as suas avaliações feitas anteriormente continuarão associadas ao seu perfil pessoal.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Posso voltar a ser apenas avaliador?</h4>
            <p className="text-sm text-muted-foreground">Sim, você poderá continuar avaliando outros negócios normalmente, mas terá acesso extra às ferramentas de gestão.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
