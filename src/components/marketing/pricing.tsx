'use client'

import React from 'react'
import { Check, Sparkles, Tag, ShieldCheck } from 'lucide-react'
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 max-w-6xl mx-auto">
          {/* FREE PLAN */}
          <Card className="flex flex-col border-2 border-border/50 bg-background/50 backdrop-blur-sm relative transition-all hover:border-primary/20 rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold">{PRICING_PLANS.FREE.name}</CardTitle>
              <CardDescription className="text-sm font-medium">Para começar agora</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ 0</span>
                <span className="text-muted-foreground font-bold">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-8 pt-0">
              <ul className="space-y-4">
                {PRICING_PLANS.FREE.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm font-medium opacity-50">
                   <Tag className="h-4 w-4 shrink-0" />
                   Sem Tag NFC inclusa
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <Button className="w-full font-bold h-12 rounded-xl cursor-pointer" variant="outline" render={<Link href="/register" />}>
                Começar Grátis
              </Button>
            </CardFooter>
          </Card>

          {/* BUSINESS PLAN (Highlighted) */}
          <Card className="flex flex-col border-2 border-primary bg-primary/[0.02] relative shadow-2xl shadow-primary/10 scale-105 z-20 overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0">
               <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-8 rotate-45 translate-x-6 translate-y-3">
                  Recomendado
               </div>
            </div>
            <CardHeader className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary fill-primary" />
                <CardTitle className="text-xl font-bold">{PRICING_PLANS.BUSINESS.name}</CardTitle>
              </div>
              <CardDescription className="text-sm font-medium text-primary/80">O poder total do NFC</CardDescription>
              <div className="mt-4 flex items-baseline gap-1 text-primary">
                <span className="text-4xl font-black">R$ 69,90</span>
                <span className="font-bold opacity-80">/único*</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">*Taxa única de ativação + 1 Tag NFC inclusa</p>
            </CardHeader>
            <CardContent className="flex-1 p-8 pt-0">
              <ul className="space-y-4">
                {PRICING_PLANS.BUSINESS.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-bold">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <Button className="w-full font-bold h-12 rounded-xl shadow-lg shadow-primary/20 cursor-wait opacity-80" disabled>
                Em breve
              </Button>
            </CardFooter>
          </Card>

          {/* PRO PLAN */}
          <Card className="flex flex-col border-2 border-border/50 bg-background/50 backdrop-blur-sm relative transition-all hover:border-primary/20 rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold">{PRICING_PLANS.PRO.name}</CardTitle>
              <CardDescription className="text-sm font-medium">Para negócios em crescimento</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ 9,90</span>
                <span className="text-muted-foreground font-bold">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-8 pt-0">
              <ul className="space-y-4">
                {PRICING_PLANS.PRO.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <Button className="w-full font-bold h-12 rounded-xl cursor-wait opacity-80" variant="outline" disabled>
                Em breve
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-20 text-center">
           <p className="text-sm text-muted-foreground font-medium">
             Precisa de um plano personalizado para sua rede ou franquia? 
             <a href={`https://wa.me/${APP_CONFIG.whatsappOrderNumber}`} className="text-primary font-bold ml-1 hover:underline">Fale com nosso team</a>
           </p>
        </div>
      </div>
    </section>
  )
}
