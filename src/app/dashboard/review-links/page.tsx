'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { PageLink } from '@/core/domain/entities'
import { Card, CardContent } from '@/components/ui/card'
import { MoreVertical, Trash2, ExternalLink, Star } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateReviewLinkDialog } from '@/components/dashboard/create-review-link-dialog'
import { GoogleReviewTutorial } from '@/components/dashboard/google-review-tutorial'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function ReviewLinksPage() {
  const { currentBusiness } = useBusiness()
  const [links, setLinks] = useState<PageLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])

  const fetchLinks = useCallback(async () => {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      const page = await pageRepo.getByBusinessId(currentBusiness.id)
      if (page) {
        const data = await linkRepo.getByPageId(page.id)
        // Only show Google Review type links here
        setLinks(data.filter(l => l.type === 'google_review'))
      } else {
        setLinks([])
      }
    } catch {
      toast.error('Erro ao carregar botões de avaliação')
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, pageRepo, linkRepo])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este botão de avaliação?')) return
    try {
      await linkRepo.delete(id)
      toast.success('Botão excluído com sucesso')
      fetchLinks()
    } catch {
      toast.error('Erro ao excluir botão')
    }
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
        <p className="text-muted-foreground mt-2">Selecione uma empresa na barra lateral para ver seus botões de avaliação.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Botões de Avaliação</h1>
          <p className="text-muted-foreground">
            Gerencie as chamadas para ação para <strong>{currentBusiness.name}</strong>.
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
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="max-w-md w-full space-y-6">
                <div className="flex flex-col items-center">
                  <Star className="h-12 w-12 text-primary mb-4 opacity-20" />
                  <p className="text-muted-foreground">Você ainda não tem botões de avaliação configurados.</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Crie uma chamada para ação personalizada para começar a coletar avaliações no Google.
                  </p>
                </div>

                <Alert className="text-left bg-primary/5 border-primary/20">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-sm font-bold">Por que configurar?</AlertTitle>
                  <AlertDescription className="text-xs">
                    Ter um botão de avaliação configurado é obrigatório para que seus clientes possam te avaliar via NFC ou QR Code e para obter o selo de verificação.
                  </AlertDescription>
                </Alert>

                <div className="text-left border rounded-xl p-4 bg-muted/30">
                  <GoogleReviewTutorial />
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Texto do Botão</TableHead>
                  <TableHead>Link de Destino (Google)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {link.url}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        Ativo na Página
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Testar Botão
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            variant="destructive"
                            className="cursor-pointer"
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
