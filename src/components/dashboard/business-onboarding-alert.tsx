'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, CheckCircle2, MessageSquare, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { cn } from '@/lib/utils'

interface BusinessOnboardingAlertProps {
  businessId: string
}

export function BusinessOnboardingAlert({ businessId }: BusinessOnboardingAlertProps) {
  const [hasPageLinks, setHasPageLinks] = useState(true)
  const [hasReviewLink, setHasReviewLink] = useState(true)
  const [isPublished, setIsPublished] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const checkStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const [pageRes, reviewLinks] = await Promise.all([
        supabase.from('business_pages').select('id, is_published').eq('business_id', businessId).maybeSingle(),
        new ReviewLinkRepository().getByBusinessId(businessId)
      ])

      if (pageRes.data) {
        const pageLinks = await new PageLinkRepository().getByPageId(pageRes.data.id)
        setHasPageLinks(pageLinks.length > 0)
        setIsPublished(pageRes.data.is_published)
      } else {
        setHasPageLinks(false)
        setIsPublished(false)
      }

      setHasReviewLink(reviewLinks.length > 0)
    } catch (err) {
      console.error('Failed to check onboarding status', err)
    } finally {
      setIsLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    if (businessId) {
      checkStatus()
    }
  }, [businessId, checkStatus])

  if (isLoading || (hasPageLinks && hasReviewLink && isPublished)) return null

  const isEligibleForVerification = hasPageLinks && hasReviewLink

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 font-bold">
              <AlertCircle className="h-5 w-5" />
              Complete o Perfil da sua Empresa
            </div>
            
            <p className="text-sm text-yellow-700 leading-relaxed">
              Para que sua tag NFC funcione corretamente e você possa solicitar a <strong>Verificação Oficial</strong>, 
              sua empresa precisa de alguns ajustes:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className={cn(
                "p-3 rounded-xl border flex items-center gap-3 transition-colors",
                hasReviewLink ? "bg-green-500/5 border-green-500/20" : "bg-background border-border shadow-sm"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  hasReviewLink ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                )}>
                  {hasReviewLink ? <CheckCircle2 className="h-5 w-5" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Link do Google</p>
                  <p className="text-[10px] text-muted-foreground">Obrigatório para avaliações</p>
                </div>
              </div>

              <div className={cn(
                "p-3 rounded-xl border flex items-center gap-3 transition-colors",
                hasPageLinks ? "bg-green-500/5 border-green-500/20" : "bg-background border-border shadow-sm"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  hasPageLinks ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                )}>
                  {hasPageLinks ? <CheckCircle2 className="h-5 w-5" /> : <LinkIcon className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Links Sociais</p>
                  <p className="text-[10px] text-muted-foreground">Instagram, WhatsApp, etc.</p>
                </div>
              </div>
            </div>

            {!isPublished && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-700">Página Privada</p>
                  <p className="text-[10px] text-blue-600/80">Sua página não aparecerá para o público até ser configurada.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border-t md:border-t-0 md:border-l border-yellow-500/10 p-6 flex flex-col justify-center gap-3 w-full md:w-64">
            {!hasReviewLink && (
              <Button size="sm" className="w-full gap-2 font-bold cursor-pointer" render={<Link href="/dashboard/review-links" />}>
                Configurar Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {!hasPageLinks && (
              <Button size="sm" variant={hasReviewLink ? "default" : "outline"} className="w-full gap-2 font-bold cursor-pointer" render={<Link href="/dashboard/page-editor" />}>
                Adicionar Redes
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {isEligibleForVerification && (
               <Button size="sm" className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" render={<Link href="/dashboard/page-editor" />}>
                  <ShieldCheck className="h-4 w-4" />
                  Solicitar Verificação
               </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
