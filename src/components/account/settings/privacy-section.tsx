'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PrivacySection() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Simulating data preparation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Seus dados estão sendo preparados.', {
      description: 'Você receberá um link para download no seu e-mail em breve (simulação LGPD).'
    })
    setIsExporting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacidade e LGPD
        </CardTitle>
        <CardDescription>
          Gerencie seus dados e entenda como protegemos sua privacidade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <p className="text-sm font-bold">Exportar meus dados</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Baixe uma cópia de todas as suas avaliações e informações de perfil em formato JSON.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport} 
            disabled={isExporting}
            className="cursor-pointer"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Exportar Dados
          </Button>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            No <strong>Avalia Prudente</strong>, levamos a sério a sua privacidade. Seus dados são usados exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identificar suas avaliações para as empresas (apenas nome de exibição).</li>
            <li>Prevenir fraudes e abusos no sistema de avaliações.</li>
            <li>Notificar você sobre respostas de empresas, caso opte por isso.</li>
          </ul>
          <p className="text-xs italic pt-2">
            Nunca compartilhamos seu e-mail ou dados de contato com terceiros ou com as empresas avaliadas sem seu consentimento explícito.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
