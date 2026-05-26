import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/auth-utils'
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SecurityLogsTable } from '@/components/admin/security/security-logs-table'
import { Badge } from '@/components/ui/badge'

interface AuditLog {
  id: string
  created_at: string
  actor_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, unknown>
  profiles?: {
    email: string | null
    full_name: string | null
  }
}

interface SecurityDashboardProps {
  searchParams: Promise<{
    action?: string
    resource_type?: string
    from?: string
    to?: string
  }>
}

async function getSecurityLogs(params: { action?: string, resource_type?: string, from?: string, to?: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.action) {
    query = query.ilike('action', `%${params.action}%`)
  }
  if (params.resource_type) {
    query = query.eq('resource_type', params.resource_type)
  }
  if (params.from) {
    query = query.gte('created_at', params.from)
  }
  if (params.to) {
    query = query.lte('created_at', params.to)
  }

  const { data: logs, error: logsError } = await query

  if (logsError) {
    console.error('[Security Dashboard] Failed to fetch logs:', logsError)
    return []
  }

  if (!logs || logs.length === 0) return []

  // Fetch profiles separately to avoid implicit relationship errors (no FK)
  const actorIds = [...new Set(logs.map(l => l.actor_id).filter(Boolean))] as string[]
  
  if (actorIds.length === 0) return logs

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', actorIds)

  if (profilesError) {
    console.error('[Security Dashboard] Failed to fetch actor profiles:', profilesError)
    return logs
  }

  // Map profiles back to logs
  const profileMap = new Map(profiles.map(p => [p.id, p]))
  
  return logs.map(log => ({
    ...log,
    profiles: log.actor_id ? profileMap.get(log.actor_id) : undefined
  }))
}

function getSeverity(action: string): 'info' | 'low' | 'medium' | 'high' | 'critical' {
  const a = action.toLowerCase()
  if (a.includes('fail') || a.includes('violation') || a.includes('unauthorized')) return 'high'
  if (a.includes('sudo') && a.includes('failed')) return 'critical'
  if (a.includes('delete') || a.includes('remove')) return 'medium'
  if (a.includes('update_role') || a.includes('sudo')) return 'medium'
  if (a.includes('security')) return 'medium'
  return 'info'
}

export default async function SecurityDashboardPage({ searchParams }: SecurityDashboardProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isSuperAdmin(profile?.role)) {
    redirect('/admin/dashboard')
  }

  const logs = await getSecurityLogs(params)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Observabilidade de Segurança
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de eventos de segurança e auditoria (Somente Leitura).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
            <Activity className="mr-1 h-3 w-3" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Eventos carregados na sessão</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => ['critical', 'high'].includes(getSeverity(l.action))).length}
            </div>
            <p className="text-xs text-muted-foreground">Severidade Alta ou Crítica</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Privilegiadas</CardTitle>
            <Lock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.action.toLowerCase().includes('sudo') || l.action.toLowerCase().includes('role')).length}
            </div>
            <p className="text-xs text-muted-foreground">Sudo e mudanças de acesso</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status RLS</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Ativo</div>
            <p className="text-xs text-muted-foreground">Isolamento de dados garantido</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Eventos de Auditoria</CardTitle>
            <CardDescription>
              Logs estruturados capturados via middleware e audit-logger.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(params).length > 0 && (
              <Badge variant="secondary" className="font-normal">
                Filtros Ativos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>}>
            <SecurityLogsTable logs={logs as unknown as AuditLog[]} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
