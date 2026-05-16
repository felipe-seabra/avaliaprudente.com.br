'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { Review, AnalyticsEvent } from '@/core/domain/entities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, MessageSquare, Building2, MousePointer2, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { currentBusiness, businesses, isLoading: isBusinessLoading } = useBusiness()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const reviewRepo = useMemo(() => new ReviewRepository(), [])
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBusiness) return
      setIsLoading(true)
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewRepo.getByBusinessId(currentBusiness.id),
          analyticsRepo.getStatsByBusinessId(currentBusiness.id)
        ])
        setReviews(reviewsData)
        setStats(statsData as AnalyticsEvent[])
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        toast.error('Erro ao carregar dados', { description: message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentBusiness, reviewRepo, analyticsRepo])

  if (isBusinessLoading || (isLoading && stats.length === 0)) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-10 w-64 bg-muted rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
      </div>
    </div>
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Bem-vindo ao Avalia Prudente!</h1>
        <p className="text-muted-foreground max-w-md">
          Para começar, você precisa cadastrar sua primeira empresa. Use o seletor na barra lateral ou o botão abaixo.
        </p>
      </div>
    )
  }

  if (!currentBusiness) return null

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const pageVisits = stats.filter(s => s.event_type === 'page_visit').length
  const ctaClicks = stats.filter(s => s.event_type === 'cta_click').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Olá, bem-vindo de volta!</h1>
        <p className="text-muted-foreground">
          Aqui está o resumo de <strong>{currentBusiness.name}</strong>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas na Página</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageVisits}</div>
            <p className="text-xs text-muted-foreground">Leituras NFC / QR</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques em CTAs</CardTitle>
            <MousePointer2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctaClicks}</div>
            <p className="text-xs text-muted-foreground">Engajamento total</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Interna</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Satiscação média</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
