'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Loader2, ChevronRight, LucideIcon, ShieldCheck, Trophy, Zap, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RankedBusiness {
  id: string
  name: string
  slug: string
  logo_url: string | null
  avg_rating: number
  review_count: number
  visit_count: number
  is_verified?: boolean
  is_featured?: boolean
  rank_score: number
  trending_score: number
}

interface SupabaseBusinessResponse {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_verified: boolean
  is_featured: boolean
  reviews: { rating: number, created_at: string }[]
  analytics_events: { event_type: string, created_at: string }[]
}

export function BusinessRanking() {
  const [mostViewed, setMostViewed] = useState<RankedBusiness[]>([])
  const [topRated, setTopRated] = useState<RankedBusiness[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRanking() {
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // Fetch businesses with reviews and analytics
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select(`
            id, 
            name, 
            slug, 
            logo_url,
            is_verified,
            is_featured,
            reviews (rating, created_at),
            analytics_events (event_type, created_at)
          `)
          .limit(100)

        if (error) throw error

        const typedBusinesses = businesses as unknown as SupabaseBusinessResponse[]

        // Algorithm Constants
        const MIN_REVIEWS_THRESHOLD = 2
        const GLOBAL_MEAN_RATING = 4.0
        const FEATURED_BOOST = 0.5

        // Process data
        const processed = (typedBusinesses || []).map(b => {
          const reviews = b.reviews || []
          const analytics = b.analytics_events || []
          
          const reviewCount = reviews.length
          const avgRating = reviewCount > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
            : 0

          // 1. Elite Score (Bayesian Average)
          let eliteScore = reviewCount >= MIN_REVIEWS_THRESHOLD
            ? (reviewCount * avgRating + MIN_REVIEWS_THRESHOLD * GLOBAL_MEAN_RATING) / (reviewCount + MIN_REVIEWS_THRESHOLD)
            : (reviewCount * avgRating) / 2 // Penalty for very low volume

          if (b.is_featured) eliteScore += FEATURED_BOOST

          // 2. Trending Score (Recent Engagement)
          const recentAnalytics = analytics.filter(e => {
             const eventDate = new Date(e.created_at)
             return eventDate >= thirtyDaysAgo && e.event_type === 'page_visit'
          })
          
          const trendingScore = recentAnalytics.length + (b.is_featured ? 10 : 0)

          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            logo_url: b.logo_url,
            avg_rating: avgRating || 5.0,
            review_count: reviewCount,
            visit_count: recentAnalytics.length,
            rank_score: eliteScore,
            trending_score: trendingScore,
            is_verified: b.is_verified, // Use real DB value
            is_featured: b.is_featured
          }
        })

        const limit = 5
        
        // Final Sorting: Stable Descending
        const eliteRanking = [...processed]
          .filter(b => b.review_count > 0)
          .sort((a, b) => {
            if (b.rank_score !== a.rank_score) return b.rank_score - a.rank_score
            return b.review_count - a.review_count // Tie-break with volume
          })
          .slice(0, limit)

        const trendingRanking = [...processed]
          .filter(b => b.visit_count > 0 || b.is_featured)
          .sort((a, b) => {
            if (b.trending_score !== a.trending_score) return b.trending_score - a.trending_score
            return b.rank_score - a.rank_score // Tie-break with rating
          })
          .slice(0, limit)

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

  const RankingCarousel = ({ 
    title, 
    icon: Icon, 
    items, 
    badgeColor, 
    description, 
    emptyMsg 
  }: { 
    title: string, 
    icon: LucideIcon, 
    items: RankedBusiness[], 
    badgeColor: string, 
    description: string, 
    emptyMsg: string 
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 10)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
      }
    }, [])

    useEffect(() => {
      checkScroll()
      window.addEventListener('resize', checkScroll)
      return () => window.removeEventListener('resize', checkScroll)
    }, [checkScroll, items])

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        })
      }
    }

    return (
      <div className="space-y-8 relative group/section">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl shadow-sm", badgeColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium ml-12">{description}</p>
          </div>
          
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-300 shadow-sm hover:border-primary/50", 
                  !canScrollLeft && "opacity-20 cursor-not-allowed border-muted"
                )}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-300 shadow-sm hover:border-primary/50", 
                  !canScrollRight && "opacity-20 cursor-not-allowed border-muted"
                )}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] text-muted-foreground/50 text-sm font-medium bg-muted/5">
               {emptyMsg}
            </div>
          ) : (
            items.map((item) => (
              <Link 
                key={item.id} 
                href={`/r/${item.slug}`} 
                className="flex-none w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start group/card"
              >
                <Card className="border-none bg-background/40 backdrop-blur-sm transition-all hover:bg-background hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 rounded-[2rem] overflow-hidden ring-1 ring-border/50 group-hover/card:ring-primary/30 h-full relative">
                  {item.is_featured && (
                    <div className="absolute top-4 right-4 z-10">
                       <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4 h-full justify-between">
                    <div className="space-y-4 flex flex-col items-center w-full">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-muted bg-white shrink-0 shadow-sm transition-transform group-hover/card:scale-110">
                        {item.logo_url ? (
                          <Image src={item.logo_url} alt={item.name} fill className="object-contain p-1.5" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-black text-primary text-2xl bg-primary/5 uppercase">
                            {item.name[0]}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1 w-full">
                        <h4 className="font-bold text-base truncate group-hover/card:text-primary transition-colors tracking-tight px-2">
                          {item.name}
                        </h4>
                        {(item.is_verified || item.is_featured) && (
                          <div className="flex items-center justify-center gap-1.5">
                            {item.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />}
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                               {item.is_featured ? 'Destaque' : 'Verificado'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full pt-4 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-black">{item.avg_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                        {item.review_count} avaliações
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 space-y-24">
      <RankingCarousel 
        title="Elite da Cidade" 
        description="Os estabelecimentos com as maiores notas e volume de satisfação."
        icon={Trophy} 
        items={topRated} 
        badgeColor="bg-yellow-500/10 text-yellow-600" 
        emptyMsg="A elite está sendo calculada..."
      />
      <RankingCarousel 
        title="Em Alta Agora" 
        description="Negócios com maior volume de acessos e interações NFC recentes."
        icon={Zap} 
        items={mostViewed} 
        badgeColor="bg-primary/10 text-primary" 
        emptyMsg="Aguardando dados de tráfego recentes..."
      />
    </div>
  )
}
