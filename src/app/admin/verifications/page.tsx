'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, Search, Loader2, Clock, XCircle, MessageSquare } from 'lucide-react'
import { VerificationRepository, VerificationRequest } from '@/core/infrastructure/repositories/supabase-verification-repository'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // Memoize repo
  const [repo] = useState(() => new VerificationRepository())

  const loadRequests = useCallback(async () => {
    try {
      const data = await repo.getAllForAdmin()
      setRequests(data)
    } catch (err) {
      console.error('Admin Verifications: Failed to load', err)
      toast.error('Erro ao carregar solicitações')
    } finally {
      setIsLoading(false)
    }
  }, [repo])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const adminResponse = action === 'reject' 
      ? window.prompt('Motivo da rejeição:', 'Sua empresa não atende aos critérios mínimos no momento.') 
      : null

    if (action === 'reject' && adminResponse === null) return

    try {
      if (action === 'approve') {
        await repo.approve(id)
        toast.success('Pedido aprovado com sucesso!')
      } else {
        await repo.reject(id, adminResponse!)
        toast.success('Pedido rejeitado.')
      }
      loadRequests()
    } catch (error) {
      console.error('Error handling verification action', error)
      toast.error('Erro ao processar a ação.')
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.businesses?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-500 hover:bg-blue-600 gap-1"><ShieldCheck className="h-3 w-3" /> Aprovado</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitado</Badge>
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pedidos de Verificação</h1>
          <p className="text-muted-foreground">Modere as solicitações de selo oficial das empresas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresa ou usuário..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-lg border w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs h-8 px-3", statusFilter === 'all' && "bg-background shadow-sm")}
              onClick={() => setStatusFilter('all')}
            >
              Tudo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs h-8 px-3", statusFilter === 'pending' && "bg-background shadow-sm")}
              onClick={() => setStatusFilter('pending')}
            >
              Pendentes
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs h-8 px-3", statusFilter === 'approved' && "bg-background shadow-sm text-blue-600")}
              onClick={() => setStatusFilter('approved')}
            >
              Aprovados
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Solicitações de Selo</CardTitle>
          </div>
          <CardDescription>Gerencie o status de confiança dos estabelecimentos.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border-t">
               <p>Nenhum pedido de verificação encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-bold">
                        <div className="flex flex-col gap-1">
                          {request.businesses?.name}
                          <code className="text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground w-fit">
                            /r/{request.businesses?.slug}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{request.profiles?.full_name}</span>
                          <span className="text-xs text-muted-foreground">{request.profiles?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                         <div className="flex items-start gap-2">
                            <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              {request.message || 'Sem mensagem adicional.'}
                            </p>
                         </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleAction(request.id, 'approve')}
                            >
                               Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-destructive hover:bg-destructive/5 cursor-pointer"
                              onClick={() => handleAction(request.id, 'reject')}
                            >
                               Rejeitar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                            Processado em {formatDate(request.reviewed_at)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
