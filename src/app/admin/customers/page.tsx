'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Search, Loader2, Calendar, User, MoreHorizontal, Ban, ShieldAlert, AlertTriangle, BadgeCheck, RotateCcw, Clock, UserX } from 'lucide-react'
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
import { ModerationWarningDialog } from '@/components/admin/moderation-warning-dialog'
import { ModerationSuspensionDialog } from '@/components/admin/moderation-suspension-dialog'
import { ModerationBanDialog } from '@/components/admin/moderation-ban-dialog'
import { ModerationDeactivationDialog } from '@/components/admin/moderation-deactivation-dialog'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

// Extend Profile entity with moderation fields
interface ModeratedProfile extends Profile {
  warning_count: number
  account_status: 'active' | 'warned' | 'suspended' | 'banned'
  suspended_until: string | null
  banned_at: string | null
  is_deleted: boolean
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<ModeratedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  
  // Dialogs State
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)
  const [isSuspensionDialogOpen, setIsSuspensionDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isDeactivationDialogOpen, setIsDeactivationDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null)
  
  const [repo] = useState(() => new AdminRepository())

  const loadCustomers = useCallback(async () => {
    try {
      const [data, { data: authData }] = await Promise.all([
        repo.getAllCustomers(),
        createClient().auth.getUser()
      ])
      
      setCustomers(data as ModeratedProfile[] || [])
      setCurrentAdminId(authData.user?.id || null)
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

  const handleReactivateAccount = async (id: string) => {
    if (!confirm('Deseja reativar esta conta agora?')) return
    try {
      await repo.reactivateUser(id)
      toast.success('Conta reativada com sucesso.')
      loadCustomers()
    } catch (error) {
      console.error('Error reactivating user', error)
      toast.error('Erro ao reativar conta.')
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

  const handleOpenWarningDialog = (id: string, name: string) => {
    setSelectedUser({ id, name })
    setIsWarningDialogOpen(true)
  }

  const handleOpenSuspensionDialog = (id: string, name: string) => {
    setSelectedUser({ id, name })
    setIsSuspensionDialogOpen(true)
  }

  const handleOpenBanDialog = (id: string, name: string) => {
    setSelectedUser({ id, name })
    setIsBanDialogOpen(true)
  }

  const handleOpenDeactivationDialog = (id: string, name: string) => {
    setSelectedUser({ id, name })
    setIsDeactivationDialogOpen(true)
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
                    <TableHead>Moderação</TableHead>
                    <TableHead>Registrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className={customer.is_deleted || customer.account_status === 'suspended' || customer.account_status === 'banned' ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                             {(customer.full_name || customer.email || 'U').substring(0, 1).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                             <div className="flex items-center gap-1">
                               <span className="truncate max-w-[150px]">{customer.full_name || 'Usuário sem nome'}</span>
                               {customer.id === currentAdminId && (
                                 <Badge variant="outline" className="text-[9px] h-4 px-1 text-primary border-primary/20">Você</Badge>
                               )}
                             </div>
                             {customer.is_deleted && (
                               <span className="text-[10px] text-destructive font-bold uppercase flex items-center gap-1">
                                 <UserX className="h-3 w-3" /> Desativado
                               </span>
                             )}
                             {customer.account_status === 'banned' && (
                               <span className="text-[10px] text-destructive font-bold uppercase flex items-center gap-1">
                                 <Ban className="h-3 w-3" /> Banimento Permanente
                               </span>
                             )}
                             {customer.account_status === 'suspended' && (
                               <span className="text-[10px] text-destructive font-bold uppercase flex items-center gap-1">
                                 <Clock className="h-3 w-3" /> Suspenso até {formatDate(customer.suspended_until)}
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
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {customer.is_deleted ? (
                            <Badge variant="destructive" className="text-[10px] uppercase font-bold gap-1 bg-gray-900 hover:bg-gray-800">
                               <UserX className="h-2.5 w-2.5" /> Desativado
                            </Badge>
                          ) : customer.account_status === 'banned' ? (
                            <Badge variant="destructive" className="text-[10px] uppercase font-bold gap-1 bg-red-600 hover:bg-red-700">
                               <Ban className="h-2.5 w-2.5" /> Banido
                            </Badge>
                          ) : customer.account_status === 'suspended' ? (
                            <Badge variant="destructive" className="text-[10px] uppercase font-bold gap-1">
                               <ShieldAlert className="h-2.5 w-2.5" /> Suspenso
                            </Badge>
                          ) : customer.account_status === 'warned' ? (
                            <Badge variant="warning" className="text-[10px] uppercase font-bold gap-1">
                               <AlertTriangle className="h-2.5 w-2.5" /> Avisado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/10 text-[10px] uppercase font-bold gap-1">
                               <BadgeCheck className="h-2.5 w-2.5" /> Ativo
                            </Badge>
                          )}
                          {customer.warning_count > 0 && (
                            <div className="flex items-center gap-1">
                               <span className="text-[10px] font-bold text-muted-foreground px-1">
                                  {customer.warning_count} {customer.warning_count === 1 ? 'aviso' : 'avisos'}
                               </span>
                               {customer.warning_count >= 2 && customer.account_status !== 'suspended' && (
                                 <span className="text-[8px] bg-red-500 text-white px-1 rounded font-black animate-pulse">ESCALAR</span>
                               )}
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
                            
                            {/* Send Warning Action */}
                            <DropdownMenuItem 
                              className="cursor-pointer text-yellow-600 font-medium" 
                              onClick={() => handleOpenWarningDialog(customer.id, customer.full_name || customer.email || 'Usuário')}
                              disabled={customer.id === currentAdminId || customer.account_status === 'suspended'}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Enviar Aviso
                            </DropdownMenuItem>

                            {/* Suspend Action - Phase 2 */}
                            {customer.account_status !== 'suspended' && customer.account_status !== 'banned' && !customer.is_deleted ? (
                               <DropdownMenuItem 
                                  className="cursor-pointer text-destructive font-bold" 
                                  onClick={() => handleOpenSuspensionDialog(customer.id, customer.full_name || customer.email || 'Usuário')}
                                  disabled={customer.id === currentAdminId}
                               >
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  Suspender Conta
                               </DropdownMenuItem>
                            ) : customer.account_status === 'suspended' || customer.account_status === 'banned' || customer.is_deleted ? (
                               <DropdownMenuItem 
                                  className="cursor-pointer text-green-600 font-bold" 
                                  onClick={() => handleReactivateAccount(customer.id)}
                               >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Reativar Conta
                               </DropdownMenuItem>
                            ) : null}

                            <DropdownMenuSeparator />
                            
                            {customer.account_status === 'banned' ? (
                              <DropdownMenuItem className="cursor-pointer text-green-600" onClick={() => handleReactivateAccount(customer.id)}>
                                <BadgeCheck className="h-4 w-4 mr-2" />
                                Remover Banimento
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive font-bold" 
                                onClick={() => handleOpenBanDialog(customer.id, customer.full_name || customer.email || 'Usuário')}
                                disabled={customer.id === currentAdminId || customer.is_deleted}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Banir permanentemente
                              </DropdownMenuItem>
                            )}

                            {!customer.is_deleted && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive" 
                                onClick={() => handleOpenDeactivationDialog(customer.id, customer.full_name || customer.email || 'Usuário')}
                                disabled={customer.id === currentAdminId}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desativar Conta
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            
                            {customer.role === 'admin' ? (
                              <DropdownMenuItem 
                                className="cursor-pointer text-orange-600" 
                                onClick={() => handleSetRole(customer.id, 'customer')}
                                disabled={customer.id === currentAdminId}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Remover Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer text-blue-600" onClick={() => handleSetRole(customer.id, 'admin')}>
                                <ShieldAlert className="h-4 w-4 mr-2" />
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

      {/* Dialogs */}
      {selectedUser && (
        <>
          <ModerationWarningDialog
            open={isWarningDialogOpen}
            onOpenChange={setIsWarningDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
            onSuccess={loadCustomers}
          />
          <ModerationSuspensionDialog
            open={isSuspensionDialogOpen}
            onOpenChange={setIsSuspensionDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
            onSuccess={loadCustomers}
          />
          <ModerationBanDialog
            open={isBanDialogOpen}
            onOpenChange={setIsBanDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
            onSuccess={loadCustomers}
          />
          <ModerationDeactivationDialog
            open={isDeactivationDialogOpen}
            onOpenChange={setIsDeactivationDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
            onSuccess={loadCustomers}
          />
        </>
      )}
    </div>
  )
}
