'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Search, Loader2, Calendar, User, MoreHorizontal, Ban, ShieldAlert } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Profile } from '@/core/domain/entities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [repo] = useState(() => new AdminRepository())

  const loadCustomers = useCallback(async () => {
    try {
      const data = await repo.getAllCustomers()
      setCustomers(data as Profile[] || [])
    } catch (err) {
      console.error('Admin Customers: Failed to load', err)
      toast.error('Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }, [repo])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBlockUser = async (id: string, isBlocked: boolean) => {
    if (!confirm(isBlocked ? 'Tem certeza que deseja bloquear este usuário?' : 'Tem certeza que deseja desbloquear este usuário?')) return
    try {
      if (isBlocked) {
        await repo.blockUser(id)
        toast.success('Usuário bloqueado com sucesso.')
      } else {
        await repo.unblockUser(id)
        toast.success('Usuário desbloqueado com sucesso.')
      }
      loadCustomers()
    } catch (error) {
      console.error('Error blocking/unblocking user', error)
      toast.error('Erro ao processar a ação.')
    }
  }

  const handleSetRole = async (id: string, role: 'admin' | 'customer') => {
    if (!confirm(`Deseja alterar a função deste usuário para ${role}?`)) return
    try {
      await repo.setAdminRole(id, role === 'admin')
      toast.success('Função atualizada com sucesso.')
      loadCustomers()
    } catch (error) {
      console.error('Error updating role', error)
      toast.error('Erro ao alterar a função.')
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários cadastrados na plataforma.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Diretório de Usuários</CardTitle>
          </div>
          <CardDescription>Total de {filteredCustomers.length} usuários registrados.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border-t">
               <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status / Função</TableHead>
                    <TableHead>Registrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className={customer.is_blocked ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                             {(customer.full_name || customer.email || 'U').substring(0, 1).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                             <span className="truncate max-w-[150px]">{customer.full_name || 'Usuário sem nome'}</span>
                             {customer.is_blocked && (
                               <span className="text-[10px] text-destructive font-bold uppercase flex items-center gap-1">
                                 <Ban className="h-3 w-3" /> Bloqueado
                               </span>
                             )}
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-sm">{customer.email || '-'}</span>
                            <span className="text-xs text-muted-foreground">{customer.username || ''}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {customer.role === 'admin' ? (
                            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20 w-fit">
                               <ShieldAlert className="h-3 w-3" />
                               Admin
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs uppercase bg-muted px-2 py-1 rounded-full border border-border w-fit">
                               <User className="h-3 w-3" />
                               Cliente
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(customer.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Moderação</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigator.clipboard.writeText(customer.id)}>
                              Copiar ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {customer.is_blocked ? (
                              <DropdownMenuItem className="cursor-pointer text-green-600" onClick={() => handleBlockUser(customer.id, false)}>
                                Desbloquear Usuário
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleBlockUser(customer.id, true)}>
                                Bloquear Usuário
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            
                            {customer.role === 'admin' ? (
                              <DropdownMenuItem className="cursor-pointer text-orange-600" onClick={() => handleSetRole(customer.id, 'customer')}>
                                Remover Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer text-blue-600" onClick={() => handleSetRole(customer.id, 'admin')}>
                                Promover a Admin
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
