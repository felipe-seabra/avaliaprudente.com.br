'use client'

import React, { useState } from 'react'
import { CTAButton } from '@/components/shared/cta-button'
import { ReviewFlow } from '@/components/shared/review-flow'
import { Star, ShieldCheck, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { PageLink, BusinessPage, Review } from '@/core/domain/entities'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'

interface BusinessPageClientProps {
  data: {
    page: BusinessPage & { 
      businesses: { 
        name: string, 
        logo_url: string | null, 
        slug: string, 
        id?: string,
        is_verified?: boolean | null,
        is_frozen?: boolean 
      } 
    }
    links: PageLink[]
    reviews: Review[]
    isAdmin?: boolean
  }
}

export function BusinessPageClient({ data }: BusinessPageClientProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const { page, links, reviews } = data

  const themeConfig = (page.theme_config || {}) as { primary_color?: string }
  const primaryColor = themeConfig.primary_color || '#7c3aed'

  const googleReviewLink = links.find(l => l.type === 'google_review')
  const displayLinks = links.filter(l => l.type !== 'google_review')

  useEffect(() => {
    // Track visit
    const trackVisit = async () => {
      try {
        const analyticsRepo = new AnalyticsRepository()
        const urlParams = new URLSearchParams(window.location.search)
        const source = urlParams.get('utm_source') || urlParams.get('s') || 'direct'
        
        analyticsRepo.track({
          business_id: page.business_id,
          page_id: page.id,
          event_type: 'page_visit',
          source,
        })
      } catch (err) {
        console.error('Failed to track visit:', err)
      }
    }
    
    trackVisit()
  }, [page.business_id, page.id])

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  if (isReviewing) {
    return (
      <div 
        className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500"
        style={{ '--primary': primaryColor } as React.CSSProperties}
      >
        <div className="w-full max-w-[500px]">
          <ReviewFlow 
            businessId={page.business_id}
            businessName={page.businesses.name}
            googleReviewUrl={googleReviewLink?.url || ''}
            onClose={() => setIsReviewing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-700 pb-20"
      style={{ '--primary': primaryColor } as React.CSSProperties}
    >
      <div className="w-full max-w-[500px] flex flex-col items-center text-center">
        {/* Header / Logo */}
        <div className="mb-8 w-full">
          {page.businesses.logo_url ? (
            <div 
              className="relative h-24 w-24 rounded-full overflow-hidden border-2 mb-4 bg-background shadow-lg mx-auto transition-transform hover:scale-105 duration-300"
              style={{ borderColor: `var(--primary)33` }}
            >
              <Image 
                src={page.businesses.logo_url} 
                alt={page.businesses.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div 
              className="h-24 w-24 rounded-full flex items-center justify-center mb-4 border-2 shadow-lg mx-auto"
              style={{ backgroundColor: `var(--primary)1a`, borderColor: `var(--primary)33` }}
            >
              <span className="text-3xl font-bold" style={{ color: `var(--primary)` }}>
                {page.businesses.name.substring(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{page.businesses.name}</h1>
          
          {/* Trust Indicators */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
             <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-foreground font-bold">{avgRating}</span>
                <span className="opacity-70">({reviews.length || '10+'})</span>
             </div>
             
             {page.businesses.is_verified && (
               <>
                 <div className="h-3 w-px bg-border" />
                 <div className="flex items-center gap-1 text-blue-600">
                    <ShieldCheck className="h-3 w-3 fill-blue-500/10" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Verificado</span>
                 </div>
               </>
             )}
          </div>

          {page.description && (
            <p className="text-muted-foreground mt-4 px-6 leading-relaxed text-sm">
              {page.description}
            </p>
          )}
        </div>

        {/* Primary Native Review Action */}
        <div className="w-full px-2 mb-8">
          <Button 
            className="w-full h-16 text-lg font-bold rounded-[1.25rem] shadow-xl shadow-primary/20 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] gap-2"
            onClick={() => setIsReviewing(true)}
          >
            <Star className="h-5 w-5 fill-current" />
            Avaliar Agora
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-widest font-bold opacity-40">
            Sua opinião é fundamental para nós
          </p>
        </div>

        {/* Modular CTAs */}
        <div className="w-full space-y-4 px-2 mb-12">
          {displayLinks.length === 0 ? (
            <div className="py-16 px-8 border-2 border-dashed rounded-3xl opacity-40">
               <p className="text-sm text-muted-foreground">Nenhum link disponível no momento.</p>
            </div>
          ) : (
            displayLinks.map((link, index) => (
              <div 
                key={link.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CTAButton 
                  link={link} 
                  businessId={page.business_id}
                />
              </div>
            ))
          )}
        </div>

        {/* Social Proof / Reviews Section */}
        {reviews.length > 0 && (
          <div className="w-full px-2 space-y-6 text-left">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-lg font-bold flex items-center gap-2">
                 <MessageSquare className="h-5 w-5" style={{ color: `var(--primary)` }} />
                 O que dizem nossos clientes
               </h2>
            </div>
            
            <div className="space-y-4">
              {reviews
                .slice(0, 5)
                .map((review, idx) => (
                <Card key={review.id} className="border-none shadow-sm bg-background/60 backdrop-blur-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                           <Star 
                             key={i} 
                             className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted opacity-20'}`} 
                           />
                         ))}
                       </div>
                       <span className="text-[10px] text-muted-foreground">
                         {new Date(review.created_at).toLocaleDateString('pt-BR')}
                       </span>
                    </div>
                    {review.feedback && review.feedback.trim() !== '' && (
                      <p className="text-sm text-foreground/90 italic leading-relaxed">
                        &quot;{review.feedback}&quot;
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                       <div 
                         className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                         style={{ backgroundColor: `var(--primary)1a`, color: `var(--primary)` }}
                       >
                         {(review.customer_name || 'U').substring(0, 1).toUpperCase()}
                       </div>
                       <span className="text-xs font-medium">{review.customer_name || 'Cliente Verificado'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-20 pb-8">
          <Link 
            href="/" 
            className="group flex flex-col items-center gap-1 transition-all duration-300"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold group-hover:text-[var(--primary)] transition-colors transition-colors-primary">
              Digital Presence by <span style={{ color: `var(--primary)` }} className="font-bold">Avalia Prudente</span>
            </p>
            <span className="text-[8px] text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
              Conheça a plataforma
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
