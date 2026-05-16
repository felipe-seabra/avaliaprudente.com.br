'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, TrendingUp, Loader2, ChevronRight, LucideIcon } from 'lucide-react'
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
}

interface SupabaseBusinessResponse {
  id: string
  name: string
  slug: string
  logo_url: string | null
  reviews: { rating: number }[]
}

export function BusinessRanking() {
  const [mostViewed, setMostViewed] = useState<RankedBusiness[]>([])
  const [topRated, setTopRated] = useState<RankedBusiness[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRanking() {
      try {
        // This is a simplified ranking query. 
        // In a real production app, we would use a cached materialized view or a more complex RPC.
        
        // 1. Fetch businesses with their reviews
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select(`
            id, 
            name, 
            slug, 
            logo_url,
            reviews (rating)
          `)
          .limit(20)

        if (error) throw error

        const typedBusinesses = businesses as unknown as SupabaseBusinessResponse[]

        // 2. Process data
        const processed = (typedBusinesses || []).map(b => {
          const reviews = b.reviews || []
          const avg = reviews.length > 0 
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
            : 5.0
          
          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            logo_url: b.logo_url,
            avg_rating: avg,
            review_count: reviews.length,
            visit_count: Math.floor(Math.random() * 1000) // Mocked visits for now
          }
        })

        // Sort for different sections
        setTopRated([...processed].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 4))
        setMostViewed([...processed].sort((a, b) => b.visit_count - a.visit_count).slice(0, 4))
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  const RankingSection = ({ title, icon: Icon, items, badgeColor }: { title: string, icon: LucideIcon, items: RankedBusiness[], badgeColor: string }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", badgeColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/r/${item.slug}`} className="group">
            <Card className="border-none bg-background/50 backdrop-blur-sm transition-all hover:bg-background hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 rounded-2xl overflow-hidden ring-1 ring-border/50 group-hover:ring-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-muted bg-muted shrink-0 shadow-inner">
                  {item.logo_url ? (
                    <Image src={item.logo_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-primary text-lg">
                      {item.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{item.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[11px] font-bold">{item.avg_rating.toFixed(1)}</span>
                    </div>
                    <div className="h-3 w-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-medium">{item.review_count} avaliações</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto px-4">
      <RankingSection 
        title="Melhores Avaliadas" 
        icon={Star} 
        items={topRated} 
        badgeColor="bg-yellow-500/10 text-yellow-600" 
      />
      <RankingSection 
        title="Mais Visualizadas" 
        icon={TrendingUp} 
        items={mostViewed} 
        badgeColor="bg-primary/10 text-primary" 
      />
    </div>
  )
}
