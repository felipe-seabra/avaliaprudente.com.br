'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, Search } from 'lucide-react'

export function GoogleReviewTutorial() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
        <HelpCircle className="h-4 w-4" />
        Como encontrar seu link do Google?
      </div>
      
      <Accordion className="w-full">
        <AccordionItem value="step-1" className="border-border/50">
          <AccordionTrigger className="text-xs font-bold hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">1</span>
              Pesquise sua empresa
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pl-7">
            Acesse o <a href="https://www.google.com.br/maps" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Google Maps</a> ou a pesquisa do Google e digite o nome exato da sua empresa.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-2" className="border-border/50">
          <AccordionTrigger className="text-xs font-bold hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">2</span>
              Clique em &quot;Solicitar avaliações&quot;
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pl-7">
            No painel do seu Perfil da Empresa, procure pelo botão <strong>&quot;Solicitar avaliações&quot;</strong> ou <strong>&quot;Receber mais avaliações&quot;</strong>.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-3" className="border-border/50">
          <AccordionTrigger className="text-xs font-bold hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">3</span>
              Copie o link curto
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed pl-7">
            Uma janela abrirá com um link parecido com <code className="bg-muted px-1 rounded">g.page/r/XYZ/review</code>. Copie esse link e cole no campo acima.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-3 bg-muted/50 rounded-xl border border-dashed border-border flex gap-3 items-start">
        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-wider">Exemplos de links válidos:</p>
          <ul className="text-[10px] text-muted-foreground/80 space-y-0.5">
            <li>• g.page/sua-empresa/review</li>
            <li>• search.google.com/local/writereview?placeid=...</li>
            <li>• maps.app.goo.gl/ABC123XYZ</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
