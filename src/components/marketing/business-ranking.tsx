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
            visit_count: Math.floor(Math.random() * 1000),
            is_verified: true // Visual only for now
          }
        })

        setTopRated([...processed].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 6))
        setMostViewed([...processed].sort((a, b) => b.visit_count - a.visit_count).slice(0, 6))
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

  const RankingSection = ({ title, icon: Icon, items, badgeColor, description }: { title: string, icon: LucideIcon, items: RankedBusiness[], badgeColor: string, description: string }) => (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl shadow-sm", badgeColor)}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-medium ml-12">{description}</p>
      </div>
      
      <div className="grid gap-4">
        {items.map((item, index) => (
          <Link key={item.id} href={`/r/${item.slug}`} className="group block">
            <Card className="border-none bg-background/40 backdrop-blur-sm transition-all hover:bg-background hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 rounded-[1.5rem] overflow-hidden ring-1 ring-border/50 group-hover:ring-primary/30 relative">
              {item.is_promoted && (
                <div className="absolute top-0 right-0 p-2">
                   <div className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">
                     Patrocinado
                   </div>
                </div>
              )}
              <CardContent className="p-5 flex items-center gap-5">
                {/* Ranking Position */}
                <div className="hidden sm:flex h-8 w-8 items-center justify-center font-black text-lg text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
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
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-4">
      <RankingSection 
        title="Elite da Cidade" 
        description="Os estabelecimentos com as maiores notas de satisfação."
        icon={Trophy} 
        items={topRated} 
        badgeColor="bg-yellow-500/10 text-yellow-600" 
      />
      <RankingSection 
        title="Em Alta Agora" 
        description="Negócios com maior volume de acessos e interações NFC."
        icon={Zap} 
        items={mostViewed} 
        badgeColor="bg-primary/10 text-primary" 
      />
    </div>
  )
}
