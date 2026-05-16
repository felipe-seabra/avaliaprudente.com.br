import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, SmartphoneNfc, Zap, Star } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="container relative mx-auto max-w-6xl px-4 md:px-8 flex flex-col items-center text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <Image
            src="/branding/logo-vertical.webp"
            alt={APP_CONFIG.name}
            width={160}
            height={160}
            className="h-32 w-auto object-contain mb-8 mx-auto"
            priority
          />
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
            <Zap className="mr-2 h-4 w-4 fill-primary" />
            <span>Aproximou, avaliou. Simples assim.</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 leading-[1.1]">
            A tag inteligente que <span className="text-gradient">conecta seu balcão</span> ao mundo digital
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed mx-auto">
            Tenha uma página interativa da sua empresa. Basta o cliente aproximar o celular da sua tag NFC para acessar WhatsApp, Instagram e avaliar seu negócio no Google.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base h-12 px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform rounded-xl">
              Quero minha tag NFC
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Abstract NFC Mockup */}
        <div className="mt-20 relative w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full w-full pointer-events-none" />
          <div className="relative aspect-video w-full bg-card rounded-[2.5rem] border-4 border-muted overflow-hidden shadow-2xl flex items-center justify-center rotate-x-6 transform-gpu perspective-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-5" />
            
            <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full px-12">
              {/* Phone Mockup */}
              <div className="w-40 h-[350px] border-[8px] border-zinc-800 rounded-[2.5rem] bg-background shadow-2xl flex flex-col items-center pt-4 relative z-20 transition-transform duration-700 hover:scale-105">
                <div className="w-16 h-1.5 bg-muted rounded-full mb-4" />
                <div className="flex-1 w-full bg-card px-3 pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center border border-primary/20">
                    <Image src="/branding/logo-vertical.webp" alt="V" width={20} height={20} className="h-4 w-auto" />
                  </div>
                  <div className="w-20 h-2 bg-muted mx-auto rounded-full" />
                  <div className="space-y-2">
                    <div className="w-full h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
                       <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="w-full h-10 border rounded-lg" />
                    <div className="w-full h-10 border rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* NFC Card Mockup */}
              <div className="w-48 h-72 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col items-center justify-between p-8 text-white relative z-10 hover:-translate-y-4 transition-transform duration-500">
                <div className="w-full flex justify-between items-start">
                   <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                      <SmartphoneNfc size={20} className="text-primary" />
                   </div>
                   <Image src="/branding/logo-horizontal.webp" alt="Logo" width={80} height={20} className="h-3 w-auto opacity-80" />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                     <Zap className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest text-center">Aproxime</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full" />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
