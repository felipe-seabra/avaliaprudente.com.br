'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { AnalyticsEvent } from '@/core/domain/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, MousePointer2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const { currentBusiness } = useBusiness()
  const [stats, setStats] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  useEffect(() => {
    async function fetchStats() {
      if (!currentBusiness) return
      setIsLoading(true)
      try {
        const data = await analyticsRepo.getStatsByBusinessId(currentBusiness.id)
        setStats(data as AnalyticsEvent[])
      } catch {
        toast.error('Erro ao carregar estatísticas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [currentBusiness, analyticsRepo])

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
      </div>
    )
  }

  const pageVisits = stats.filter(s => s.event_type === 'page_visit')
  const ctaClicks = stats.filter(s => s.event_type === 'cta_click')

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho de <strong>{currentBusiness.name}</strong> em tempo real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Totais</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageVisits.length}</div>
            <p className="text-xs text-muted-foreground">Leituras NFC / QR</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento (Cliques)</CardTitle>
            <MousePointer2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctaClicks.length}</div>
            <p className="text-xs text-muted-foreground">Interação com botões</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pageVisits.length > 0 
                ? ((ctaClicks.length / pageVisits.length) * 100).toFixed(1) 
                : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">Cliques por visita</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Os últimos 50 eventos registrados.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/30 text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Origem / Detalhes</th>
                  <th className="px-6 py-4 text-right">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t">
                {stats.slice(0, 50).map((event) => (
                  <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {event.event_type === 'page_visit' ? '👁️ Visita na Página' : '🖱️ Clique em CTA'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {event.source || (event.metadata as { title?: string })?.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums opacity-60">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {stats.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma atividade registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
