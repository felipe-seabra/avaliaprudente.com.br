'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldAlert, Info, AlertTriangle, CheckCircle, Ban, Clock } from 'lucide-react'

// Helper to format dates natively
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatLongDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

type ModerationMetadata = {
  suspended_until?: string
  business_id?: string
  [key: string]: unknown
}

type ModerationAction = {
  id: string
  action_type: string
  reason: string
  created_at: string
  metadata: ModerationMetadata | null
}

type AccountStatusData = {
  account_status: string
  warning_count: number
  suspended_until: string | null
  banned_at: string | null
  banned_reason: string | null
}

export default function ModerationCenterPage() {
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [status, setStatus] = useState<AccountStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch account status
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_status, warning_count, suspended_until, banned_at, banned_reason')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setStatus(profile as AccountStatusData)
        }

        // Fetch moderation actions
        const { data: moderationActions } = await supabase
          .from('moderation_actions')
          .select('*')
          .eq('target_user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (moderationActions) {
          setActions(moderationActions as unknown as ModerationAction[])
        }
      } catch (error) {
        console.error('Error fetching moderation data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ativa</Badge>
      case 'warned':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Com Avisos</Badge>
      case 'suspended':
        return <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">Suspensa</Badge>
      case 'banned':
        return <Badge variant="destructive">Banida</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionTypeBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Aviso</Badge>
      case 'suspension':
        return <Badge variant="outline" className="text-orange-500 border-orange-500/50">Suspensão</Badge>
      case 'ban':
        return <Badge variant="outline" className="text-destructive border-destructive/50">Banimento</Badge>
      case 'reactivation':
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">Reativação</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Central de Transparência</h1>
        <p className="text-muted-foreground">Histórico de moderação e integridade da sua conta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Status da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status && getStatusBadge(status.account_status)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sua conta está em conformidade com as diretrizes.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Contagem de Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.warning_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {status?.warning_count === 0 
                ? 'Nenhum aviso registrado.' 
                : `${status?.warning_count} ${status?.warning_count === 1 ? 'aviso formal recebido.' : 'avisos formais recebidos.'}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Integridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado nas diretrizes de comunidade.
            </p>
          </CardContent>
        </Card>
      </div>

      {status?.account_status === 'suspended' && status.suspended_until && (
        <Alert variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          <Clock className="h-4 w-4" />
          <AlertTitle className="font-bold">Conta Suspensa</AlertTitle>
          <AlertDescription>
            Sua conta está temporariamente suspensa até <strong>{formatLongDate(status.suspended_until)}</strong>.
            Acesso ao dashboard está restrito.
          </AlertDescription>
        </Alert>
      )}

      {status?.account_status === 'banned' && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle className="font-bold">Conta Banida Permanentemente</AlertTitle>
          <AlertDescription>
            Sua conta foi permanentemente banida da plataforma. <br />
            <strong>Motivo:</strong> {status.banned_reason || 'Violação grave dos Termos de Uso.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Moderação</CardTitle>
          <CardDescription>Todas as ações tomadas em relação à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="text-xs">
                      {formatDate(action.created_at)}
                    </TableCell>
                    <TableCell>
                      {getActionTypeBadge(action.action_type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {action.reason}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {action.action_type === 'suspension' && action.metadata?.suspended_until && (
                        <span>Suspensão até {formatShortDate(action.metadata.suspended_until)}</span>
                      )}
                      {action.action_type === 'freeze' && action.metadata?.business_id && (
                        <span>Empresa congelada</span>
                      )}
                      {!action.metadata && '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold">Nenhum registro encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Sua conta não possui histórico de violações ou ações de moderação.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" /> Política de Escalonamento
          </h3>
          <p className="text-sm text-muted-foreground">
            Nosso sistema de moderação é progressivo e visa educar antes de punir:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
              <div>
                <p className="text-sm font-bold">Aviso Formal</p>
                <p className="text-xs text-muted-foreground">Recebido após a primeira violação leve detectada.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
              <div>
                <p className="text-sm font-bold">Suspensão Temporária</p>
                <p className="text-xs text-muted-foreground">Bloqueio de 3 a 90 dias após múltiplos avisos ou violação moderada.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
              <div>
                <p className="text-sm font-bold">Banimento Permanente</p>
                <p className="text-xs text-muted-foreground">Encerramento definitivo em casos de fraudes graves ou reincidência contínua.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold">Contestações</h3>
          <p className="text-sm text-muted-foreground">
            Se você acredita que uma ação de moderação foi injusta ou equivocada, você pode entrar em contato com nossa equipe de suporte para uma revisão manual.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Envie um e-mail para:<br />
            <a href="mailto:suporte@avaliaprudente.com.br" className="text-primary hover:underline">suporte@avaliaprudente.com.br</a>
          </p>
          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tempo médio de resposta: 48 horas úteis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
