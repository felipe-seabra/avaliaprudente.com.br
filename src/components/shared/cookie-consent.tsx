'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Cookie, Settings2, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CONSENT_KEY = 'avaliaprudente_cookie_consent'

export type ConsentState = {
  essential: boolean
  analytics: boolean
  version: string
}

const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  version: '1.0',
}

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(CONSENT_KEY)
    if (!saved) {
      setShow(true)
    } else {
      try {
        setConsent(JSON.parse(saved))
      } catch {
        setShow(true)
      }
    }
  }, [])

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    setConsent(state)
    setShow(false)
    setIsCustomizing(false)
    // Dispatch event for analytics repository to pick up
    window.dispatchEvent(new Event('cookie-consent-updated'))
  }

  const handleAcceptAll = () => {
    saveConsent({ ...DEFAULT_CONSENT, analytics: true })
  }

  const handleRejectAll = () => {
    saveConsent({ ...DEFAULT_CONSENT, analytics: false })
  }

  const handleSavePreferences = () => {
    saveConsent(consent)
  }

  if (!mounted || !show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="mx-auto max-w-4xl border-none shadow-[0_0_50px_rgba(0,0,0,0.15)] bg-background/95 backdrop-blur-md rounded-[2rem] overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {!isCustomizing ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="font-bold text-lg">Respeitamos sua privacidade</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência e analisar o tráfego. 
                  Ao clicar em &quot;Aceitar Todos&quot;, você concorda com o uso de cookies analíticos conforme nossa{' '}
                  <Link href="/privacy" className="underline hover:text-primary">Política de Privacidade</Link>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(true)} className="w-full sm:w-auto gap-2">
                  <Settings2 className="h-4 w-4" />
                  Personalizar
                </Button>
                <Button variant="outline" size="sm" onClick={handleRejectAll} className="w-full sm:w-auto">
                  Recusar
                </Button>
                <Button size="sm" onClick={handleAcceptAll} className="w-full sm:w-auto px-8">
                  Aceitar Todos
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Preferências de Cookies
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsCustomizing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <p className="text-sm font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Cookies Essenciais
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Necessários para o funcionamento do site, como autenticação e segurança. Não podem ser desativados.
                    </p>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded">Obrigatório</div>
                </div>

                <div 
                  className={cn(
                    "flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    consent.analytics ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/50 hover:bg-muted/20"
                  )}
                  onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Cookies Analíticos</p>
                    <p className="text-xs text-muted-foreground">
                      Nos ajudam a entender como os usuários interagem com o site, coletando dados de uso e performance.
                    </p>
                  </div>
                  <div className={cn(
                    "h-6 w-11 rounded-full relative transition-colors duration-200",
                    consent.analytics ? "bg-primary" : "bg-muted-foreground/30"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200",
                      consent.analytics ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsCustomizing(false)}>Voltar</Button>
                <Button onClick={handleSavePreferences} className="px-12">Salvar Preferências</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Utility to check if a specific consent category is granted.
 */
export function hasConsent(category: keyof Omit<ConsentState, 'version'>): boolean {
  if (typeof window === 'undefined') return false
  
  // Essential cookies are always true
  if (category === 'essential') return true
  
  try {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (!saved) return false
    const state: ConsentState = JSON.parse(saved)
    return state[category] || false
  } catch {
    return false
  }
}
