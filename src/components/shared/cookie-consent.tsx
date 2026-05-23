'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border/40 bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500">
      <div className="container mx-auto max-w-6xl px-4 py-4 md:py-3">
        {!isCustomizing ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-snug max-w-2xl">
                Utilizamos cookies para melhorar sua experiência. 
                Ao continuar, você concorda com nossa{' '}
                <Link href="/privacy" className="underline hover:text-primary font-medium">Política de Privacidade</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(true)} className="h-8 px-3 text-[11px] uppercase tracking-wider font-bold">
                Configurar
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="h-8 px-4 text-[11px] uppercase tracking-wider font-bold">
                Recusar
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="h-8 px-6 text-[11px] uppercase tracking-wider font-bold">
                Aceitar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
                Preferências de Cookies
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCustomizing(false)} className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="h-3 w-3 text-green-500" />
                    Essenciais
                  </p>
                  <p className="text-[10px] text-muted-foreground">Funcionamento e segurança do site.</p>
                </div>
                <div className="text-[9px] uppercase font-black text-muted-foreground/50">Ativo</div>
              </div>

              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  consent.analytics ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/40 hover:bg-muted/20"
                )}
                onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide">Analíticos</p>
                  <p className="text-[10px] text-muted-foreground">Melhoria de performance e uso.</p>
                </div>
                <div className={cn(
                  "h-5 w-9 rounded-full relative transition-colors duration-200",
                  consent.analytics ? "bg-primary" : "bg-muted-foreground/30"
                )}>
                  <div className={cn(
                    "absolute top-1 left-1 h-3 w-3 rounded-full bg-white transition-transform duration-200",
                    consent.analytics ? "translate-x-4" : "translate-x-0"
                  )} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(false)} className="h-7 text-[10px] uppercase font-bold">Voltar</Button>
              <Button size="sm" onClick={handleSavePreferences} className="h-7 px-8 text-[10px] uppercase font-bold">Salvar e Fechar</Button>
            </div>
          </div>
        )}
      </div>
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
