'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Search, Loader2, Calendar, ShieldCheck, User } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Profile } from '@/core/domain/entities'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      try {
        const repo = new AdminRepository()
        const data = await repo.getAllCustomers()
        setCustomers(data as Profile[] || [])
      } catch (err) {
        console.error('Admin Customers: Failed to load', err)
        toast.error('Erro ao carregar clientes')
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários cadastrados na plataforma.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar nome ou usuário..."
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
                    <TableHead>Username</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Registrado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                             {(customer.full_name || 'U').substring(0, 1).toUpperCase()}
                           </div>
                           {customer.full_name || 'Usuário sem nome'}
                        </div>
                      </TableCell>
                      <TableCell>{customer.username || '-'}</TableCell>
                      <TableCell>
                        {customer.role === 'admin' ? (
                          <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase bg-destructive/5 px-2 py-1 rounded-full border border-destructive/10 w-fit">
                             <ShieldCheck className="h-3 w-3" />
                             Administrador
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-xs uppercase bg-muted px-2 py-1 rounded-full border border-border w-fit">
                             <User className="h-3 w-3" />
                             Cliente
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.updated_at || '').toLocaleDateString('pt-BR')}
                        </div>
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
