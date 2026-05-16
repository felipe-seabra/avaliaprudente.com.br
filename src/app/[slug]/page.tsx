'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useBusinessPage } from '@/hooks/use-business-page'
import { CTAButton } from '@/components/shared/cta-button'
import { ReviewFlow } from '@/components/shared/review-flow'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { PageLink } from '@/core/domain/entities'

export default function BusinessPublicPage() {
  const { slug } = useParams()
  const { data, isLoading, error } = useBusinessPage(slug as string)
  const [activeReviewLink, setActiveReviewLink] = useState<PageLink | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">404</h1>
        <p className="text-muted-foreground mt-2">{error || 'Página não encontrada'}</p>
      </div>
    )
  }

  const { page, links } = data

  if (activeReviewLink) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
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
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-[500px] flex flex-col items-center text-center">
        {/* Header / Logo */}
        <div className="mb-8">
          {page.businesses.logo_url ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 mb-4 bg-background shadow-sm mx-auto">
              <Image 
                src={page.businesses.logo_url} 
                alt={page.businesses.name} 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20 shadow-sm mx-auto">
              <span className="text-3xl font-bold text-primary">
                {page.businesses.name.substring(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{page.businesses.name}</h1>
          {page.description && (
            <p className="text-muted-foreground mt-2 px-4 leading-relaxed">
              {page.description}
            </p>
          )}
        </div>

        {/* Modular CTAs */}
        <div className="w-full space-y-4">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12">Nenhum link disponível no momento.</p>
          ) : (
            links.map((link) => (
              <CTAButton 
                key={link.id} 
                link={link} 
                businessId={page.business_id}
                onClick={link.type === 'google_review' ? () => setActiveReviewLink(link) : undefined}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-16 pb-8">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 opacity-50">
            Powered by <span className="font-semibold">Avalia Prudente</span>
          </p>
        </div>
      </div>
    </div>
  )
}
