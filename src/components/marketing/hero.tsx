import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, SmartphoneNfc } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="container relative mx-auto max-w-6xl px-4 md:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SmartphoneNfc className="mr-2 h-4 w-4" />
          <span>Aproximou, avaliou. Simples assim.</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          A placa inteligente que <span className="text-gradient">conecta seu balcão</span> ao mundo digital
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 leading-relaxed">
          Tenha uma página interativa da sua empresa. Basta o cliente aproximar o celular da sua placa NFC para acessar WhatsApp, Instagram e avaliar seu negócio no Google.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base h-12 px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Quero minha placa NFC
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Abstract NFC Mockup */}
        <div className="mt-20 relative w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full w-full pointer-events-none" />
          <div className="relative aspect-[16/9] w-full bg-card rounded-xl border-4 border-muted overflow-hidden shadow-2xl flex items-center justify-center rotate-x-12 transform-gpu perspective-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)]" />
            
            <div className="flex gap-12 items-center justify-center">
              {/* Phone Mockup */}
              <div className="w-32 h-64 border-[6px] border-muted-foreground/20 rounded-3xl bg-background shadow-xl flex flex-col items-center pt-4 opacity-90 relative z-20 translate-x-8 -rotate-6 transition-transform duration-700 hover:rotate-0 hover:translate-x-0">
                <div className="w-12 h-1.5 bg-muted rounded-full mb-4" />
                <div className="flex-1 w-full bg-card px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mt-4 mb-2" />
                  <div className="w-16 h-2 bg-muted mx-auto rounded-full mb-4" />
                  <div className="w-full h-8 bg-muted/50 rounded-lg mb-2" />
                  <div className="w-full h-8 bg-muted/50 rounded-lg mb-2" />
                  <div className="w-full h-8 bg-primary/10 rounded-lg" />
                </div>
              </div>
              
              {/* NFC Card Mockup */}
              <div className="w-40 h-56 rounded-xl bg-gradient-to-br from-primary/80 to-purple-600 shadow-[0_0_50px_rgba(var(--primary),0.3)] flex flex-col items-center justify-center p-6 text-white relative z-10 hover:-translate-y-4 transition-transform duration-500">
                <SmartphoneNfc size={48} className="mb-4 opacity-80" />
                <span className="font-bold text-lg">Aproxime</span>
                <span className="text-xs opacity-70 mt-1 text-center">Para avaliar e conectar</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
