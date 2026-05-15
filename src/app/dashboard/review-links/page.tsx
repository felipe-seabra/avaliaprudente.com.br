'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { ReviewLink } from '@/core/domain/entities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link2, MoreVertical, Trash2, ExternalLink } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateReviewLinkDialog } from '@/components/dashboard/create-review-link-dialog'

export default function ReviewLinksPage() {
  const { currentBusiness } = useBusiness()
  const [links, setLinks] = useState<ReviewLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const repository = useMemo(() => new ReviewLinkRepository(), [])

  const fetchLinks = useCallback(async () => {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      const data = await repository.getByBusinessId(currentBusiness.id)
      setLinks(data)
    } catch {
      toast.error('Erro ao carregar links')
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, repository])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return
    try {
      await repository.delete(id)
      toast.success('Link excluído com sucesso')
      fetchLinks()
    } catch {
      toast.error('Erro ao excluir link')
    }
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
        <p className="text-muted-foreground mt-2">Selecione uma empresa na barra lateral para ver seus links.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Links de Avaliação</h1>
          <p className="text-muted-foreground">
            Gerencie os links de redirecionamento para <strong>{currentBusiness.name}</strong>.
          </p>
        </div>
        <CreateReviewLinkDialog onCreated={fetchLinks} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">Você ainda não tem links de redirecionamento ativos.</p>
              <p className="text-sm text-muted-foreground">Por padrão, o link principal é <strong>/r/{currentBusiness.slug}</strong>.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Redireciona para</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">/r/{link.slug}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {link.redirect_url}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/r/${link.slug}`, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Testar Link
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
