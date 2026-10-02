'use client'

import { Smartphone, Star, ExternalLink, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { APP_CONFIG } from '@/lib/constants'

const steps = [
  {
    id: '01',
    title: 'O cliente escaneia o QR Code',
    description: 'Após o atendimento ou compra, o cliente escaneia o QR Code na mesa ou balcão.',
    icon: Smartphone,
  },
  {
    id: '02',
    title: 'Deixa uma nota de 1 a 5',
    description: 'Abre uma tela simples e rápida com a sua identidade visual para ele dar a nota.',
    icon: Star,
  },
  {
    id: '03',
    title: 'Filtro em ação',
    description: 'Se a experiência for positiva, o cliente pode ser convidado a avaliar em plataformas externas. Se for neutra ou negativa, o feedback fica apenas para você.',
    icon: ShieldCheck,
  },
]

export function HowItWorks() {
  const demoUrl = `${APP_CONFIG.url}/r/demo`
  // Increased size and margin for better scannability
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(demoUrl)}&margin=1`

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
            Metodologia
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gradient">Como o Avalia Prudente funciona?</h2>
          <p className="text-lg text-muted-foreground font-medium">
            Três passos simples para transformar o balcão da sua empresa em uma máquina de avaliações positivas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 relative mb-32">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center group">
              <div className="h-24 w-24 rounded-3xl bg-background border-2 border-muted flex items-center justify-center mb-8 shadow-sm group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5 transition-all group-hover:-translate-y-1">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest border border-primary/10">
                Fase {step.id}
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs text-sm font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Interactive Demo Section */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 opacity-50" />
          <div className="bg-background/60 backdrop-blur-xl border-2 border-primary/10 rounded-[3rem] p-8 md:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Demonstração Real
                </div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Experimente agora a jornada do seu cliente
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Escaneie o QR Code ao lado com seu celular ou clique no botão abaixo para abrir a página de demonstração e ver como o sistema se comporta.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button size="lg" className="h-14 px-8 rounded-2xl font-bold gap-2 cursor-pointer shadow-lg shadow-primary/20" render={<Link href="/r/demo" target="_blank" />} nativeButton={false}>
                    <ExternalLink className="h-5 w-5" />
                    Abrir Página Demo
                  </Button>
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold cursor-pointer" render={<Link href="/register" />} nativeButton={false}>
                    Criar Minha Empresa
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="relative group">
                   <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-purple-600 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                   <div className="relative bg-white p-4 md:p-6 rounded-[2rem] shadow-2xl border-4 border-muted flex items-center justify-center">
                      <div className="relative h-44 w-44 md:h-52 md:w-52 flex items-center justify-center bg-white p-2 rounded-xl">
                         <Image 
                           src={qrCodeUrl} 
                           alt="Demo QR Code"
                           fill
                           sizes="(max-width: 768px) 176px, 208px"
                           className="object-contain"
                         />
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                   <Smartphone className="h-4 w-4 animate-bounce" />
                   Aponte a câmera do celular
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
