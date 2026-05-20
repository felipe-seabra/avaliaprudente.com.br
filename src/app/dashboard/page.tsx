'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { Review, AnalyticsEvent } from '@/core/domain/entities'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, MessageSquare, Building2, MousePointer2, Users, Link as LinkIcon, ExternalLink, QrCode, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'
import { BusinessOnboardingAlert } from '@/components/dashboard/business-onboarding-alert'
import { PlanBadge } from '@/components/dashboard/plan-badge'

export default function DashboardPage() {
  const { currentBusiness, businesses, isLoading: isBusinessLoading } = useBusiness()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const reviewRepo = useMemo(() => new ReviewRepository(), [])
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBusiness?.id) return
      setIsLoading(true)
      try {
        const [reviewsData, statsData] = await Promise.all([
          reviewRepo.getByBusinessId(currentBusiness.id),
          analyticsRepo.getStatsByBusinessId(currentBusiness.id)
        ])
        setReviews(reviewsData || [])
        setStats((statsData as AnalyticsEvent[]) || [])
      } catch (error: unknown) {
        console.error('Failed to load dashboard data:', error)
        // Only show toast, don't crash
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentBusiness?.id, reviewRepo, analyticsRepo])

  if (isBusinessLoading) {
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

  if (!currentBusiness) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-muted-foreground">Selecione uma empresa para ver os dados.</p>
      </div>
    )
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  const pageVisits = (stats || []).filter(s => s?.event_type === 'page_visit').length
  const ctaClicks = (stats || []).filter(s => s?.event_type === 'cta_click').length

  const publicUrl = `${APP_CONFIG.url}/r/${currentBusiness.slug}`

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">Olá, bem-vindo de volta!</h1>
          <p className="text-muted-foreground">
            Aqui está o resumo de <strong>{currentBusiness.name}</strong>.
          </p>
        </div>
        <div className="shrink-0">
          <PlanBadge />
        </div>
      </div>

      <BusinessOnboardingAlert businessId={currentBusiness.id} />

      {/* Public Link UX */}
      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <LinkIcon className="h-32 w-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Sua Página Pública
          </CardTitle>
          <CardDescription>
            Este é o link oficial da sua empresa. Compartilhe com seus clientes ou acesse seu QR Code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center justify-between bg-background border rounded-xl p-3 shadow-sm overflow-hidden">
              <span className="font-mono text-sm truncate px-2 text-muted-foreground">
                {publicUrl}
              </span>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none gap-2 cursor-pointer"
                render={<Link href={`/r/${currentBusiness.slug}`} target="_blank" />}
                nativeButton={false}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir
              </Button>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none gap-2 cursor-pointer"
                render={<Link href="/dashboard/qr-codes" />}
                nativeButton={false}
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas na Página</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && stats.length === 0 ? '...' : pageVisits}</div>
            <p className="text-xs text-muted-foreground">Leituras NFC / QR</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques em CTAs</CardTitle>
            <MousePointer2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && stats.length === 0 ? '...' : ctaClicks}</div>
            <p className="text-xs text-muted-foreground">Engajamento total</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && reviews.length === 0 ? '...' : reviews.length}</div>
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Interna</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading && reviews.length === 0 ? '...' : avgRating}</div>
            <p className="text-xs text-muted-foreground">Satiscação média</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
