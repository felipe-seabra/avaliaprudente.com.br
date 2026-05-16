'use client'

import React, { useState } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check, Info } from 'lucide-react'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/lib/constants'

export default function QRCodesPage() {
  const { currentBusiness } = useBusiness()
  const [qrColor, setQrColor] = useState('#7c3aed')
  const [copied, setCopied] = useState(false)

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
      </div>
    )
  }

  const businessUrl = `${APP_CONFIG.url}/${currentBusiness.slug}`

  const downloadPNG = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `qr-${currentBusiness.slug}.png`
    link.href = url
    link.click()
    toast.success('QR Code (PNG) baixado com sucesso!')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(businessUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes e Materiais</h1>
        <p className="text-muted-foreground">
          Gere materiais de alta qualidade para o seu estabelecimento.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <Card className="md:col-span-3 flex flex-col items-center justify-center p-12 bg-card border-none shadow-2xl relative overflow-hidden">
          {/* Visual decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-400/50" />
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-8 transition-transform hover:scale-[1.02]">
            <QRCodeCanvas
              id="qr-canvas"
              value={businessUrl}
              size={280}
              level="H"
              includeMargin
              fgColor={qrColor}
            />
          </div>
          
          <div className="w-full max-w-sm space-y-6">
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl border border-border/50 group transition-colors hover:bg-muted">
              <code className="text-xs truncate flex-1 font-mono opacity-60 group-hover:opacity-100">{businessUrl}</code>
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl" onClick={copyLink}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full gap-2 h-14 text-base rounded-2xl shadow-lg shadow-primary/20" onClick={downloadPNG}>
                <Download className="h-5 w-5" />
                Baixar para Celular (PNG)
              </Button>
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Ideal para redes sociais e apresentações digitais
              </p>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>Ajuste as cores do seu código.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-bold opacity-70">Cor Principal</Label>
                <div className="flex gap-3">
                  <div className="relative">
                    <Input 
                      type="color" 
                      value={qrColor} 
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-14 h-12 p-1 cursor-pointer rounded-xl border-2"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={qrColor} 
                    onChange={(e) => setQrColor(e.target.value)}
                    className="flex-1 font-mono uppercase h-12 rounded-xl"
                    placeholder="#000000"
                  />
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  {['#000000', '#7c3aed', '#2563eb', '#db2777', '#059669'].map(c => (
                    <button 
                      key={c}
                      className="w-8 h-8 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      onClick={() => setQrColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Impressão Profissional</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Para adesivos ou placas, utilize o formato **SVG** para garantir que o código não perca qualidade.
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full h-12 rounded-xl opacity-50 cursor-not-allowed" disabled>
                  Exportar SVG (Premium)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Página Pública:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Ativa
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Slug:</span>
                <span className="font-mono text-xs">/r/{currentBusiness.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
