'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, UserRound, ShieldCheck, Star, Activity, CalendarClock, AlertTriangle, EyeOff, History } from 'lucide-react'

type UserActivityData = {
  profile: {
    id: string
    full_name: string | null
    email: string | null
    username: string | null
    role: string
    created_at: string
    last_login_at: string | null
    account_status: string | null
    warning_count: number | null
    suspended_until: string | null
    banned_at: string | null
    is_deleted: boolean | null
    terms_accepted_at: string | null
    terms_version: string | null
  }
  authentication: {
    email: string | null
    created_at: string
    last_sign_in_at: string | null
    provider: string | null
    providers: string[]
    email_confirmed_at: string | null
  }
  reviews: Array<{
    id: string
    rating: number
    feedback: string | null
    display_name: string | null
    source: string
    created_at: string
    business: { name: string; slug: string } | null
  }>
  auditEvents: Array<{
    id: string
    action: string
    resource_type: string
    resource_id: string | null
    created_at: string
  }>
  moderationEvents: Array<{
    id: string
    action_type: string
    reason: string | null
    created_at: string
    admin_user_id: string | null
  }>
  tracking: {
    pageVisits: string
    reviewFlowSteps: string
    historicalLoginEvents: string
  }
}

type TimelineItem = {
  id: string
  title: string
  description: string
  createdAt: string
  kind: 'review' | 'audit' | 'moderation'
}

interface UserActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  userName: string
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Não registrado'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Não registrado' : date.toLocaleString('pt-BR')
}

function providerLabel(provider: string | null) {
  if (!provider) return 'Não identificado'
  const labels: Record<string, string> = { google: 'Google', email: 'E-mail', apple: 'Apple', azure: 'Microsoft' }
  return labels[provider] || provider
}

function actionLabel(action: string) {
  return action.replace(/[_-]+/g, ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase())
}

export function UserActivityDialog({ open, onOpenChange, userId, userName }: UserActivityDialogProps) {
  const [data, setData] = useState<UserActivityData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !userId) return

    const controller = new AbortController()
    setIsLoading(true)
    setError(null)
    setData(null)

    fetch(`/api/admin/users/${userId}/activity`, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Falha ao carregar atividade')
        return payload as UserActivityData
      })
      .then(setData)
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [open, userId])

  const timeline: TimelineItem[] = data ? [
    ...data.reviews.map((review) => ({
      id: `review-${review.id}`,
      title: `Avaliação publicada: ${review.rating}/5`,
      description: [review.business?.name || 'Empresa não identificada', review.feedback].filter(Boolean).join(' · '),
      createdAt: review.created_at,
      kind: 'review' as const,
    })),
    ...data.auditEvents.map((event) => ({
      id: `audit-${event.id}`,
      title: actionLabel(event.action),
      description: [event.resource_type, event.resource_id].filter(Boolean).join(' · '),
      createdAt: event.created_at,
      kind: 'audit' as const,
    })),
    ...data.moderationEvents.map((event) => ({
      id: `moderation-${event.id}`,
      title: `Moderação: ${actionLabel(event.action_type)}`,
      description: event.reason || 'Sem justificativa registrada',
      createdAt: event.created_at,
      kind: 'moderation' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade do usuário
          </DialogTitle>
          <DialogDescription>{userName} · Perfil, autenticação e histórico disponível</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando histórico...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Avaliações</div><div className="mt-1 text-2xl font-semibold">{data.reviews.length}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Eventos de auditoria</div><div className="mt-1 text-2xl font-semibold">{data.auditEvents.length}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Ações de moderação</div><div className="mt-1 text-2xl font-semibold">{data.moderationEvents.length}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Avisos</div><div className="mt-1 text-2xl font-semibold">{data.profile.warning_count || 0}</div></CardContent></Card>
            </div>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><UserRound className="h-4 w-4" /> Dados da conta</h3>
              <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
                <div><div className="text-xs text-muted-foreground">Nome</div><div className="font-medium">{data.profile.full_name || 'Não informado'}</div></div>
                <div><div className="text-xs text-muted-foreground">E-mail</div><div className="font-medium">{data.authentication.email || data.profile.email || 'Não informado'}</div></div>
                <div><div className="text-xs text-muted-foreground">Nome de usuário</div><div className="font-medium">{data.profile.username || 'Não informado'}</div></div>
                <div><div className="text-xs text-muted-foreground">Tipo de acesso</div><div className="font-medium">{actionLabel(data.profile.role)}</div></div>
                <div><div className="text-xs text-muted-foreground">Provedor</div><div className="font-medium">{providerLabel(data.authentication.provider)}</div></div>
                <div><div className="text-xs text-muted-foreground">E-mail confirmado</div><div className="font-medium">{data.authentication.email_confirmed_at ? 'Sim' : 'Não'}</div></div>
                <div><div className="text-xs text-muted-foreground">Cadastro</div><div className="font-medium">{formatDate(data.authentication.created_at)}</div></div>
                <div><div className="text-xs text-muted-foreground">Último login registrado</div><div className="font-medium">{formatDate(data.authentication.last_sign_in_at || data.profile.last_login_at)}</div></div>
                <div><div className="text-xs text-muted-foreground">Status da conta</div><div className="font-medium">{actionLabel(data.profile.account_status || 'active')}</div></div>
                <div><div className="text-xs text-muted-foreground">Termos aceitos</div><div className="font-medium">{formatDate(data.profile.terms_accepted_at)}</div></div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4" /> Avaliações publicadas</h3>
              {data.reviews.length ? (
                <div className="space-y-2">
                  {data.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{review.business?.name || 'Empresa não identificada'}</div>
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                      {review.feedback && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{review.feedback}</p>}
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.created_at)} · Origem: {review.source}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Nenhuma avaliação vinculada a esta conta.</p>}
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> Linha do tempo registrada</h3>
              {timeline.length ? (
                <div className="space-y-3">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex gap-3 border-l-2 pl-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        {item.description && <div className="mt-0.5 text-sm text-muted-foreground">{item.description}</div>}
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
                      </div>
                      <Badge variant="outline" className="h-fit shrink-0">{item.kind === 'review' ? 'Avaliação' : item.kind === 'audit' ? 'Auditoria' : 'Moderação'}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Não existem eventos históricos vinculados a este usuário.</p>}
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4" /> Cobertura do rastreamento</h3>
              <div className="rounded-lg border p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2"><EyeOff className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><div className="font-medium">Visitas a páginas</div><p className="text-muted-foreground">Não são vinculadas a contas no rastreamento atual. Não há histórico retroativo disponível.</p></div></div>
                  <div className="flex items-start gap-2"><EyeOff className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><div className="font-medium">Etapas do fluxo de avaliação</div><p className="text-muted-foreground">O início e o abandono de avaliações não são registrados por usuário atualmente.</p></div></div>
                  <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><div className="font-medium">Logins anteriores</div><p className="text-muted-foreground">O provedor fornece somente o último acesso disponível nesta consulta, não uma lista completa de sessões.</p></div></div>
                  <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><div className="font-medium">Privacidade</div><p className="text-muted-foreground">Endereços IP e fingerprints não são exibidos nesta tela.</p></div></div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
