'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useBusinessPage } from '@/hooks/use-business-page'
import { CTAButton } from '@/components/shared/cta-button'
import { ReviewFlow } from '@/components/shared/review-flow'
import { Loader2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { PageLink } from '@/core/domain/entities'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BusinessPublicPage() {
  const { slug } = useParams()
  const { data, isLoading, error } = useBusinessPage(slug as string)
  const [activeReviewLink, setActiveReviewLink] = useState<PageLink | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando experiência...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-muted/30">
        <div className="h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Página Indisponível</h1>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          {error || 'Não conseguimos encontrar esta página. Verifique o link ou aproxime o celular novamente.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar Novamente
          </Button>
          <Button render={<Link href="/" />} variant="ghost">
            Ir para o Site Oficial
          </Button>
        </div>
      </div>
    )
  }

  const { page, links } = data

  if (activeReviewLink) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="w-full max-w-[500px]">
          <ReviewFlow 
            businessId={page.business_id}
            businessName={page.businesses.name}
            googleReviewUrl={activeReviewLink.url}
            onClose={() => setActiveReviewLink(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-[500px] flex flex-col items-center text-center">
        {/* Header / Logo */}
        <div className="mb-10 w-full">
          {page.businesses.logo_url ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 mb-4 bg-background shadow-lg mx-auto transition-transform hover:scale-105 duration-300">
              <Image 
                src={page.businesses.logo_url} 
                alt={page.businesses.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20 shadow-lg mx-auto">
              <span className="text-3xl font-bold text-primary">
                {page.businesses.name.substring(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{page.businesses.name}</h1>
          {page.description && (
            <p className="text-muted-foreground mt-3 px-6 leading-relaxed text-sm">
              {page.description}
            </p>
          )}
        </div>

        {/* Modular CTAs */}
        <div className="w-full space-y-4 px-2">
          {links.length === 0 ? (
            <div className="py-16 px-8 border-2 border-dashed rounded-3xl opacity-40">
               <p className="text-sm text-muted-foreground">Nenhum link disponível no momento.</p>
            </div>
          ) : (
            links.map((link, index) => (
              <div 
                key={link.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CTAButton 
                  link={link} 
                  businessId={page.business_id}
                  onClick={link.type === 'google_review' ? () => setActiveReviewLink(link) : undefined}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-20 pb-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
            Digital Presence by <span className="text-primary">Avalia Prudente</span>
          </p>
        </div>
      </div>
    </div>
  )
}
