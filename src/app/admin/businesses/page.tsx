'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, Search, Loader2, ExternalLink, Calendar, MoreHorizontal, ShieldCheck, Clock, XCircle } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Business } from '@/core/domain/entities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BusinessWithProfile extends Business {
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
  verifier?: {
    full_name: string | null
  } | null
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [repo] = useState(() => new AdminRepository())

  const loadBusinesses = useCallback(async () => {
    try {
      const data = await repo.getAllBusinesses()
      setBusinesses(data as BusinessWithProfile[] || [])
    } catch (err) {
      console.error('Admin Businesses: Failed to load', err)
      toast.error('Erro ao carregar empresas')
    } finally {
      setIsLoading(false)
    }
  }, [repo])

  useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses])

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Support both old 'verified' and new 'approved' statuses for filtering
    const status = b.verification_status as string
    const normalizedStatus = status === 'verified' ? 'approved' : status
    
    const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleVerificationAction = async (id: string, action: 'approve' | 'reject' | 'remove') => {
    try {
      if (action === 'approve') {
        await repo.verifyBusiness(id)
        toast.success('Empresa verificada com sucesso.')
      } else if (action === 'reject') {
        await repo.rejectBusiness(id)
        toast.success('Solicitação de verificação rejeitada.')
      } else {
        await repo.removeBusinessVerification(id)
        toast.success('Status resetado para Pendente.')
      }
      loadBusinesses()
    } catch (error) {
      console.error('Error handling verification', error)
      toast.error('Erro ao processar a ação.')
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const renderStatusBadge = (status: string | undefined) => {
    if (status === 'verified' || status === 'approved') {
      return (
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 w-fit">
          <ShieldCheck className="h-3 w-3" /> Verificado
        </div>
      )
    }
    if (status === 'rejected') {
      return (
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-1 rounded border border-destructive/20 w-fit">
          <XCircle className="h-3 w-3" /> Rejeitado
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-1 rounded border w-fit">
        <Clock className="h-3 w-3" /> Pendente
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h1>
          <p className="text-muted-foreground">Monitore e verifique os estabelecimentos cadastrados na plataforma.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar empresa ou slug..."
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
              className={cn("text-xs h-8 px-3", statusFilter === 'approved' && "bg-background shadow-sm text-blue-600")}
              onClick={() => setStatusFilter('approved')}
            >
              Verificadas
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
              className={cn("text-xs h-8 px-3", statusFilter === 'rejected' && "bg-background shadow-sm text-destructive")}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejeitadas
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Diretório de Empresas</CardTitle>
          </div>
          <CardDescription>Total de {filteredBusinesses.length} empresas encontradas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando diretório...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border-t">
               <p>Nenhuma empresa encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.id} className={business.verification_status === 'rejected' ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-bold">
                        <div className="flex flex-col gap-1">
                          {business.name}
                          <code className="text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground w-fit">
                            /r/{business.slug}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(business.verification_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm truncate max-w-[150px]">{business.profiles?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{business.profiles?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(business.verification_status === 'verified' || business.verification_status === 'approved') ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-blue-600">{formatDate(business.verified_at)}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">por {business.verifier?.full_name || 'Sistema'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(business.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 cursor-pointer flex items-center justify-center rounded-md hover:bg-muted outline-none border-none">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações da Empresa</DropdownMenuLabel>
                            
                            <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => window.open(`/r/${business.slug}`, '_blank')}>
                              <ExternalLink className="h-4 w-4" /> Ver Página Pública
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-bold uppercase text-muted-foreground">Verificação</DropdownMenuLabel>
                            
                            {business.verification_status !== 'approved' && business.verification_status !== 'verified' && (
                              <DropdownMenuItem className="cursor-pointer text-blue-600 font-medium" onClick={() => handleVerificationAction(business.id, 'approve')}>
                                <ShieldCheck className="mr-2 h-4 w-4" /> Aprovar Verificação
                              </DropdownMenuItem>
                            )}

                            {business.verification_status === 'pending' && (
                              <DropdownMenuItem className="cursor-pointer text-destructive font-medium" onClick={() => handleVerificationAction(business.id, 'reject')}>
                                <XCircle className="mr-2 h-4 w-4" /> Rejeitar Verificação
                              </DropdownMenuItem>
                            )}
                            
                            {(business.is_verified || business.verification_status === 'approved' || business.verification_status === 'verified') && (
                              <DropdownMenuItem className="cursor-pointer text-destructive font-medium" onClick={() => handleVerificationAction(business.id, 'remove')}>
                                <XCircle className="mr-2 h-4 w-4" /> Remover Verificação
                              </DropdownMenuItem>
                            )}

                            {business.verification_status === 'rejected' && (
                              <DropdownMenuItem className="cursor-pointer text-muted-foreground" onClick={() => handleVerificationAction(business.id, 'remove')}>
                                <Clock className="mr-2 h-4 w-4" /> Mover para Pendente
                              </DropdownMenuItem>
                            )}
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
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
