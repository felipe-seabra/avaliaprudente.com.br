'use client'

import React from 'react'
import { Check, Sparkles, Tag, ShieldCheck, Zap, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PRICING_PLANS, APP_CONFIG } from '@/lib/constants'
import Link from 'next/link'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
            Planos e Preços
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-gradient pb-2">
            Escolha o plano ideal para seu negócio
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium">
            De um único estabelecimento a grandes redes, temos a solução para impulsionar sua reputação.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-8 max-w-7xl mx-auto items-stretch">
          {/* FREE PLAN */}
          <Card className="flex flex-col border-2 border-border/50 bg-background/50 backdrop-blur-sm relative transition-all hover:border-primary/20 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-bold">{PRICING_PLANS.FREE.name}</CardTitle>
              <CardDescription className="text-sm font-medium">Para testar o potencial</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground">R$ 0</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-10 pt-0">
              <ul className="space-y-4 mb-8">
                {PRICING_PLANS.FREE.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                 <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>Tags NFC podem ser compradas separadamente quando você desejar.</span>
                 </p>
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <Button className="w-full font-bold h-14 rounded-2xl cursor-pointer text-base" variant="outline" render={<Link href="/register" />}>
                Começar Grátis
              </Button>
            </CardFooter>
          </Card>

          {/* BUSINESS PLAN (Highlighted) */}
          <Card className="flex flex-col border-2 border-primary bg-primary/[0.02] relative shadow-2xl shadow-primary/10 lg:scale-110 z-20 overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 right-0">
               <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-10 rotate-45 translate-x-8 translate-y-4 shadow-sm">
                  Completo
               </div>
            </div>
            <CardHeader className="p-10 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary fill-primary" />
                <CardTitle className="text-2xl font-black text-primary">{PRICING_PLANS.BUSINESS.name}</CardTitle>
              </div>
              <CardDescription className="text-sm font-bold text-primary/80">O poder máximo do NFC</CardDescription>
              
              <div className="mt-8 space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Pagamento Inicial</span>
                  <div className="flex items-baseline gap-1 text-primary">
                    <span className="text-5xl font-black">R$ 69,90</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary/70 mt-1">Inclui 1ª Tag NFC + Envio + Ativação</span>
                </div>

                <div className="h-px bg-primary/10 w-full" />

                <div className="flex flex-col">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Plataforma</span>
                  <div className="flex items-baseline gap-1 text-foreground">
                    <span className="text-3xl font-black">R$ 19,90</span>
                    <span className="font-bold text-muted-foreground">/mês</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-10 pt-0">
              <ul className="space-y-4 mt-4">
                {PRICING_PLANS.BUSINESS.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-bold">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <Button className="w-full font-black h-16 rounded-2xl shadow-lg shadow-primary/30 cursor-pointer text-lg group gap-2" render={<Link href="/register" />}>
                <Zap className="h-5 w-5 fill-current" />
                Quero meu NFC
              </Button>
            </CardFooter>
          </Card>

          {/* PRO PLAN */}
          <Card className="flex flex-col border-2 border-border/50 bg-background/50 backdrop-blur-sm relative transition-all hover:border-primary/20 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-bold">{PRICING_PLANS.PRO.name}</CardTitle>
              <CardDescription className="text-sm font-medium">Foco em Software Digital</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground">R$ 9,90</span>
                <span className="text-muted-foreground font-bold text-lg">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-10 pt-0">
              <ul className="space-y-4 mb-8">
                {PRICING_PLANS.PRO.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                 <p className="text-xs text-muted-foreground leading-relaxed">
                    Ideal para quem já possui tags ou deseja focar apenas no redirecionamento digital.
                 </p>
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <Button className="w-full font-bold h-14 rounded-2xl cursor-wait opacity-80 text-base" variant="outline" disabled>
                Em breve
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-24 text-center max-w-3xl mx-auto space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50 text-xs font-medium text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              Tags NFC adicionais podem ser adquiridas separadamente em qualquer plano.
           </div>
           <p className="text-sm text-muted-foreground font-medium">
             Precisa de uma solução para grandes redes ou franquias? 
             <a href={`https://wa.me/${APP_CONFIG.whatsappOrderNumber}`} className="text-primary font-black ml-1 hover:underline underline-offset-4">Fale com nosso time comercial</a>
           </p>
        </div>
      </div>
    </section>
  )
}
