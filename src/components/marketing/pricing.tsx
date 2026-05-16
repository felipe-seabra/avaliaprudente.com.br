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
            Escolha o plano ideal para a sua empresa. Assine e receba sua Tag NFC em casa.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="glass-effect rounded-3xl p-8 flex flex-col hover:border-primary/30 transition-colors">
            <h3 className="text-2xl font-semibold mb-2">Plano Digital</h3>
            <p className="text-muted-foreground mb-6">Comece hoje mesmo com QR Codes.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">R$ 49</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary" />
                <span>Página Pública Modular</span>
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
                <span>Apenas arquivos digitais</span>
              </li>
            </ul>
            
            <Link href="/register">
              <Button variant="outline" className="w-full h-12 cursor-pointer">Assinar Digital</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl p-8 flex flex-col bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Recomendado
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Plano Físico (NFC)</h3>
            <p className="text-primary-foreground/80 mb-6">A experiência completa no seu balcão.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">R$ 99</span>
              <span className="text-primary-foreground/80">/mês</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>1 Tag NFC Acrílica (Envio Grátis)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Dashboard de Analytics (Cliques e Scans)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Página Modular Customizável</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Avaliações e Links Ilimitados</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white" />
                <span>Filtro Inteligente de Reputação</span>
              </li>
            </ul>
            
            <Link href="/register">
              <Button variant="secondary" className="w-full h-12 text-primary hover:scale-105 transition-transform cursor-pointer">Quero minha Tag NFC</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
