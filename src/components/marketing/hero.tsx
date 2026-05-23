import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

import { NfcHeroAnimation } from './nfc-hero-animation'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="container relative mx-auto max-w-6xl px-4 md:px-8 flex flex-col items-center text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          {/* Dark Mode Logo (White) */}
          <Image
            src="/branding/logo-vertical.webp"
            alt={APP_CONFIG.name}
            width={160}
            height={160}
            sizes="160px"
            className="h-32 w-auto object-contain mb-8 mx-auto hidden dark:block"
            priority
          />
          {/* Light Mode Logo (Dark) */}
          <Image
            src="/branding/logo-vertical-white-mode.webp"
            alt={APP_CONFIG.name}
            width={160}
            height={160}
            sizes="160px"
            className="h-32 w-auto object-contain mb-8 mx-auto block dark:hidden"
            priority
          />
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            <Zap className="mr-2 h-4 w-4 fill-primary" />
            <span>Plataforma de Reputação: Aproximou, avaliou.</span>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold mb-8 max-w-xl mx-auto leading-relaxed">
            Avalia Prudente é uma plataforma de reputação empresarial e avaliações online que ajuda consumidores a compartilhar experiências reais enquanto permite que empresas gerenciem e respondam aos feedbacks de clientes.
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 leading-[1.1]">
            A tag inteligente que <span className="text-gradient">conecta seu balcão</span> ao mundo digital
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed mx-auto">
            Tenha uma página interativa da sua empresa. Basta o cliente aproximar o celular da sua tag NFC para acessar WhatsApp, Instagram e avaliar seu negócio no Google.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-base h-12 px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform rounded-xl font-bold"
            render={<Link href="/register?mode=business" />}
            nativeButton={false}
          >
            Quero minha tag NFC
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        {/* Animated NFC Hero Interaction */}
        <div className="mt-20 w-full animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <NfcHeroAnimation />
        </div>
      </div>
    </section>
  )
}

