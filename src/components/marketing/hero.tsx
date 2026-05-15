import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, QrCode, Star } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="container relative mx-auto max-w-6xl px-4 md:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
          <Star className="mr-2 h-4 w-4" fill="currentColor" />
          <span>Aumente sua reputação no Google</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6">
          Transforme clientes satisfeitos em <span className="text-gradient">avaliações 5 estrelas</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Um sistema inteligente que filtra feedbacks negativos internamente e direciona clientes felizes direto para o Google do seu negócio.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base h-12 px-8">
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-base h-12 px-8">
              <QrCode className="mr-2 h-5 w-5" />
              Ver demonstração
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
