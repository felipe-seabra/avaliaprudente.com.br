'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Loader2, ChevronRight, LucideIcon, ShieldCheck, Trophy, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface RankedBusiness {
  id: string
  name: string
  slug: string
  logo_url: string | null
  avg_rating: number
  review_count: number
  visit_count: number
  is_verified?: boolean
  is_promoted?: boolean
  rank_score: number
}

interface SupabaseBusinessResponse {
  id: string
  name: string
  slug: string
  logo_url: string | null
  reviews: { rating: number }[]
  analytics_events: { event_type: string }[]
}

export function BusinessRanking() {
  const [mostViewed, setMostViewed] = useState<RankedBusiness[]>([])
  const [topRated, setTopRated] = useState<RankedBusiness[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRanking() {
      try {
        // Fetch businesses with reviews and analytics for real ranking
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select(`
            id, 
            name, 
            slug, 
            logo_url,
            reviews (rating),
            analytics_events (event_type)
          `)
          .limit(50)

        if (error) throw error

        const typedBusinesses = businesses as unknown as SupabaseBusinessResponse[]

        // Algorithm Logic
        const processed = (typedBusinesses || []).map(b => {
          const reviews = b.reviews || []
          const analytics = b.analytics_events || []
          
          const reviewCount = reviews.length
          const avgRating = reviewCount > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
            : 0

          const visitCount = analytics.filter(e => e.event_type === 'page_visit').length
          
          // Elite Score: (Weighted Average)
          // We add 3 "virtual" 4-star reviews to penalize low volume
          // (avg * count + 12) / (count + 3)
          const eliteScore = reviewCount >= 3 
            ? (avgRating * reviewCount + 12) / (reviewCount + 3)
            : 0

          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            logo_url: b.logo_url,
            avg_rating: avgRating || 5.0, // Display 5.0 if new but rank low
            review_count: reviewCount,
            visit_count: visitCount,
            rank_score: eliteScore,
            is_verified: true 
          }
        })

        const count = 5
        
        // Elite: Filter out those with 0 score (less than 3 reviews in our logic) or sort by eliteScore
        const eliteRanking = [...processed]
          .filter(b => b.review_count >= 1) // At least 1 review to appear
          .sort((a, b) => b.rank_score - a.rank_score)
          .slice(0, count)

        // Trending: Sort by visits
        const trendingRanking = [...processed]
          .filter(b => b.visit_count >= 1) // At least 1 visit to appear
          .sort((a, b) => b.visit_count - a.visit_count)
          .slice(0, count)

        setTopRated(eliteRanking)
        setMostViewed(trendingRanking)
      } catch (err) {
        console.error('Failed to load ranking:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRanking()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  const RankingSection = ({ title, icon: Icon, items, badgeColor, description, emptyMsg }: { title: string, icon: LucideIcon, items: RankedBusiness[], badgeColor: string, description: string, emptyMsg: string }) => (
    <div className="flex flex-col h-full">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("p-2.5 rounded-xl shadow-sm", badgeColor)}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
      </div>
      
      <div className="grid gap-4 flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[1.5rem] text-muted-foreground/50 text-sm font-medium">
             {emptyMsg}
          </div>
        ) : (
          items.map((item, index) => (
            <Link key={item.id} href={`/r/${item.slug}`} className="group block">
              <Card className="border-none bg-background/40 backdrop-blur-sm transition-all hover:bg-background hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 rounded-[1.5rem] overflow-hidden ring-1 ring-border/50 group-hover:ring-primary/30 relative h-full min-h-[88px] flex items-center">
                <CardContent className="p-5 flex items-center gap-5 w-full">
                  <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center font-black text-lg text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                     #{index + 1}
                  </div>

                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-muted bg-white shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    {item.logo_url ? (
                      <Image src={item.logo_url} alt={item.name} fill className="object-cover p-1" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-primary text-xl bg-primary/5">
                        {item.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors tracking-tight">
                        {item.name}
                      </h4>
                      {item.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 shrink-0" />}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[13px] font-black text-foreground">{item.avg_rating.toFixed(1)}</span>
                      </div>
                      <div className="h-3.5 w-px bg-border/60" />
                      <span className="text-xs text-muted-foreground font-semibold">
                        {item.review_count} <span className="opacity-60">avaliações</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <ChevronRight className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-24 gap-y-16 items-start">
        <RankingSection 
          title="Elite da Cidade" 
          description="Os estabelecimentos com as maiores notas e volume de satisfação."
          icon={Trophy} 
          items={topRated} 
          badgeColor="bg-yellow-500/10 text-yellow-600" 
          emptyMsg="A elite está sendo calculada..."
        />
        <RankingSection 
          title="Em Alta Agora" 
          description="Negócios com maior volume de acessos e interações NFC."
          icon={Zap} 
          items={mostViewed} 
          badgeColor="bg-primary/10 text-primary" 
          emptyMsg="Aguardando dados de tráfego..."
        />
      </div>
    </div>
  )
}
