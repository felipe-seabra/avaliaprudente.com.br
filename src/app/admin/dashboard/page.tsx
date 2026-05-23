'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Star, ShieldAlert, Loader2, Zap, BadgeCheck, Eye, Sparkles } from 'lucide-react'
import { AdminRepository, AdminStats } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RecentActivityEvent {
  event_type: string
  created_at: string
  businesses?: {
    name: string
    slug: string
  } | null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const repo = new AdminRepository()
        const [data, activity] = await Promise.all([
          repo.getPlatformStats(),
          repo.getRecentActivity()
        ])
        setStats(data)
        setRecentActivity(activity)
      } catch (err) {
        console.error('Admin Dashboard: Failed to load stats', err)
        toast.error('Erro ao carregar estatísticas')
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" />
            Centro de Controle Global
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Métricas em tempo real e visão operacional completa da rede.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            ) : (
              <>
                <div className="text-4xl font-black text-foreground">{stats?.totalCustomers || 0}</div>
                <p className="text-xs font-bold text-muted-foreground mt-1">Na plataforma</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            ) : (
              <>
                <div className="text-4xl font-black text-foreground">{stats?.totalBusinesses || 0}</div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-muted-foreground">
                   <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                   {stats?.verifiedBusinesses || 0} verificadas
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">Avaliações Totais</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            ) : (
              <>
                <div className="text-4xl font-black text-foreground">{stats?.totalReviews || 0}</div>
                <p className="text-xs font-bold text-muted-foreground mt-1">
                  Média Global: <span className="text-foreground">{stats?.averageRating || 0}</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">Tráfego NFC</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            ) : (
              <>
                <div className="text-4xl font-black text-foreground">{stats?.totalNfcScans || 0}</div>
                <p className="text-xs font-bold text-muted-foreground mt-1">Scans Registrados</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-md">
           <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-primary" />
                 Crescimento (Últimos 30 dias)
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                 <span className="font-bold text-sm">Novas Empresas</span>
                 <span className="text-xl font-black text-primary">+{stats?.newBusinessesThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                 <span className="font-bold text-sm">Visitas a Páginas</span>
                 <span className="text-xl font-black">{stats?.totalVisits || 0}</span>
              </div>
              <Button
                variant="outline"
                className="w-full font-bold mt-4"
                render={<Link href="/admin/stats" />}
                nativeButton={false}
              >
                 Ver Gráficos Detalhados
              </Button>
           </CardContent>
        </Card>

        <Card className="border-none shadow-md">
           <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Eye className="h-5 w-5 text-muted-foreground" />
                 Atividade Recente
              </CardTitle>
           </CardHeader>
           <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center p-8 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                   Nenhuma atividade registrada ainda.
                </div>
              ) : (
                <div className="space-y-3">
                   {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                               {activity.event_type === 'nfc_scan' ? <Zap className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div>
                               <p className="font-bold">{activity.businesses?.name || 'Empresa'}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">{activity.event_type === 'nfc_scan' ? 'Scan NFC' : 'Visita Online'}</p>
                            </div>
                         </div>
                         <div className="text-xs text-muted-foreground font-medium">
                            {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
