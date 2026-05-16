'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Building2, Star, Loader2 } from 'lucide-react'
import { AdminRepository, AdminStats } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const repo = new AdminRepository()
        const data = await repo.getPlatformStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats:', err)
        toast.error('Erro ao carregar estatísticas avançadas')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
           <BarChart3 className="h-8 w-8 text-primary" />
           Estatísticas Globais
        </h1>
        <p className="text-muted-foreground mt-1">Métricas consolidadas de crescimento e engajamento da rede Avalia Prudente.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Crescimento Recente</CardTitle>
            </div>
            <CardDescription>Desempenho dos últimos 30 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b pb-4">
                    <span className="font-bold text-muted-foreground">Novas Empresas</span>
                    <span className="text-2xl font-black text-primary">+{stats?.newBusinessesThisMonth || 0}</span>
                 </div>
                 <div className="flex items-center justify-between border-b pb-4">
                    <span className="font-bold text-muted-foreground">Conversão Verificada</span>
                    <span className="text-2xl font-black text-foreground">
                       {stats?.totalBusinesses ? Math.round(((stats.verifiedBusinesses || 0) / stats.totalBusinesses) * 100) : 0}%
                    </span>
                 </div>
                 <div className="flex items-center justify-between pb-2">
                    <span className="font-bold text-muted-foreground">Média de Avaliações / Mês</span>
                    <span className="text-2xl font-black text-foreground">
                       {stats?.totalBusinesses ? Math.round((stats.totalReviews || 0) / stats.totalBusinesses) : 0}
                    </span>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-md">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" /> Distribuição de Usuários
               </CardTitle>
             </CardHeader>
             <CardContent>
               {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-black">{stats?.totalCustomers || 0}</span>
                     <span className="text-sm font-medium text-muted-foreground pb-1">Contas Registradas</span>
                  </div>
               )}
             </CardContent>
           </Card>

           <Card className="border-none shadow-md">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Densidade de Negócios
               </CardTitle>
             </CardHeader>
             <CardContent>
               {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-black">{stats?.totalBusinesses || 0}</span>
                     <span className="text-sm font-medium text-muted-foreground pb-1">Empresas Ativas</span>
                  </div>
               )}
             </CardContent>
           </Card>

           <Card className="border-none shadow-md">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> Saúde do Ecossistema
               </CardTitle>
             </CardHeader>
             <CardContent>
               {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                  <div className="flex items-end gap-2">
                     <span className="text-3xl font-black text-foreground">{stats?.averageRating || 0}</span>
                     <span className="text-sm font-medium text-muted-foreground pb-1">Média Global ({stats?.totalReviews} avaliações)</span>
                  </div>
               )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
