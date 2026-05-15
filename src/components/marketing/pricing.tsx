import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Planos simples e transparentes</h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="glass-effect rounded-3xl p-8 flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">Básico</h3>
            <p className="text-muted-foreground mb-6">Para pequenos negócios locais.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">R$ 49</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>1 Local (Google Meu Negócio)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>QR Code Personalizado</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Filtro de avaliações negativas</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Check className="h-5 w-5 opacity-50" />
                <span>Até 100 avaliações/mês</span>
              </li>
            </ul>
            
            <Link href="/register">
              <Button variant="outline" className="w-full h-12">Começar grátis (14 dias)</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl p-8 flex flex-col bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Mais popular
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Profissional</h3>
            <p className="text-primary-foreground/80 mb-6">Para negócios em crescimento.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">R$ 99</span>
              <span className="text-primary-foreground/80">/mês</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Até 3 Locais</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>QR Codes Ilimitados</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Filtro de avaliações negativas</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Avaliações Ilimitadas</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Dashboard Analítico Avançado</span>
              </li>
            </ul>
            
            <Link href="/register">
              <Button variant="secondary" className="w-full h-12 text-primary">Assinar Profissional</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
