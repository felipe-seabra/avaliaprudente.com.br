'use client'

import React, { useState } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check, Info, SmartphoneNfc } from 'lucide-react'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/lib/constants'
import Image from 'next/image'

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
        <Card className="md:col-span-3 flex flex-col items-center justify-center p-12 bg-zinc-950 border-none shadow-2xl relative overflow-hidden group">
          {/* Physical Card Mockup Look */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_40%)] opacity-20" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center gap-2">
               <Image 
                 src="/branding/logo-vertical.webp" 
                 alt="Logo" 
                 width={100} 
                 height={100} 
                 className="h-16 w-auto invert opacity-80"
               />
               <div className="h-px w-20 bg-white/20" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8 transition-transform group-hover:scale-105 duration-500">
              <QRCodeCanvas
                id="qr-canvas"
                value={businessUrl}
                size={280}
                level="H"
                includeMargin
                fgColor={qrColor}
                imageSettings={{
                  src: "/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="flex flex-col items-center gap-2 mb-4">
                 <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                    <SmartphoneNfc className="h-3 w-3" />
                    Tecnologia NFC Ativa
                 </div>
                 <p className="text-white/40 text-[9px] uppercase tracking-tighter italic">Digital Presence by Avalia Prudente</p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group transition-colors hover:bg-white/10">
                <code className="text-xs truncate flex-1 font-mono text-white/60 group-hover:text-white/100">{businessUrl}</code>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10" onClick={copyLink}>
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full gap-2 h-14 text-base rounded-2xl shadow-xl shadow-primary/30" onClick={downloadPNG}>
                  <Download className="h-5 w-5" />
                  Baixar para Celular (PNG)
                </Button>
              </div>
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
