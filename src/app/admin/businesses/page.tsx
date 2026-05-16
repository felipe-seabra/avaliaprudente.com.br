'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, Search, Loader2, ExternalLink, Calendar } from 'lucide-react'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Business } from '@/core/domain/entities'

interface BusinessWithProfile extends Business {
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const repo = new AdminRepository()
        const data = await repo.getAllBusinesses()
        setBusinesses(data as BusinessWithProfile[] || [])
      } catch (err) {
        console.error('Admin Businesses: Failed to load', err)
        toast.error('Erro ao carregar empresas')
      } finally {
        setIsLoading(false)
      }
    }
    loadBusinesses()
  }, [])

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h1>
          <p className="text-muted-foreground">Monitore todos os estabelecimentos cadastrados na plataforma.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar empresa ou slug..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    <TableHead>Slug</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-bold">{business.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          /r/{business.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{business.profiles?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{business.profiles?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(business.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" render={<Link href={`/r/${business.slug}`} target="_blank" />} className="cursor-pointer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Ver Página</span>
                        </Button>
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
