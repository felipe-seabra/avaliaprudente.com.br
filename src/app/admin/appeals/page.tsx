'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, ShieldAlert, History, Filter } from 'lucide-react'
import { ReviewAppealDialog } from '@/components/admin/moderation/review-appeal-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface Appeal {
  id: string
  created_at: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  message: string
  user: {
    full_name: string | null
    email: string | null
  } | null
  moderation_action: {
    reason: string
    action_type: string
  } | null
}

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const supabase = createClient()

  const fetchAppeals = React.useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_appeals')
        .select(`
          *,
          user:profiles(full_name, email),
          moderation_action:moderation_actions(reason, action_type)
        `)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.in('status', ['pending', 'under_review'])
      }

      const { data, error } = await query
      if (error) throw error
      setAppeals((data as unknown as Appeal[]) || [])
    } catch (error) {
      console.error('Error fetching appeals:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter, supabase])

  useEffect(() => {
    fetchAppeals()
  }, [fetchAppeals])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600/50">Pendente</Badge>
      case 'under_review': return <Badge variant="outline" className="text-blue-500 border-blue-500/50">Em Revisão</Badge>
      case 'approved': return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">Aprovada</Badge>
      case 'rejected': return <Badge variant="outline" className="text-destructive border-destructive/50">Rejeitada</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionTypeBadge = (type: string | undefined) => {
    switch (type) {
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Aviso</Badge>
      case 'suspension': return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Suspensão</Badge>
      case 'ban': return <Badge variant="secondary" className="bg-red-100 text-red-700">Banimento</Badge>
      default: return <Badge variant="secondary">{type || 'Desconhecido'}</Badge>
    }
  }

  if (isLoading && appeals.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" /> Apelações de Moderação
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie pedidos de revisão de penalidades enviadas pelos usuários.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtro: {filter === 'pending' ? 'Pendentes' : 'Todas'}
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('pending')}>Pendentes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('all')}>Todas</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Lista de Apelações</CardTitle>
            <CardDescription>
              {filter === 'pending' 
                ? 'Mostrando apenas apelações que aguardam revisão.' 
                : 'Mostrando todo o histórico de apelações.'}
            </CardDescription>
          </div>
          <History className="h-5 w-5 text-muted-foreground opacity-50" />
        </CardHeader>
        <CardContent>
          {appeals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação Original</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appeals.map((appeal) => (
                  <TableRow key={appeal.id}>
                    <TableCell className="text-xs">
                      {formatDate(appeal.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{appeal.user?.full_name || 'Usuário'}</span>
                        <span className="text-[10px] text-muted-foreground">{appeal.user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getActionTypeBadge(appeal.moderation_action?.action_type)}
                        <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                          &quot;{appeal.moderation_action?.reason}&quot;
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appeal.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {appeal.status === 'pending' || appeal.status === 'under_review' ? (
                        <ReviewAppealDialog 
                          appealId={appeal.id}
                          userName={appeal.user?.full_name || 'Usuário'}
                          reason={appeal.moderation_action?.reason || ''}
                          userMessage={appeal.message}
                          onSuccess={fetchAppeals}
                        />
                      ) : (
                        <Button variant="ghost" size="sm" disabled className="text-[10px] h-8">
                          Revisado
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold">Nenhuma apelação encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Não há pedidos de revisão que correspondam ao filtro selecionado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
