'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { BusinessPage, PageLink } from '@/core/domain/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Plus, 
  Eye, 
  Save,
  Star,
  MessageCircle,
  Globe,
  Briefcase,
  Link as LinkIcon,
  Camera,
  Share2,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableLinkItem } from '@/components/dashboard/sortable-link-item'
import { ImageUpload } from '@/components/shared/image-upload'
import { parseError, logError } from '@/lib/error-handler'

export default function PageEditor() {
  const { currentBusiness, refreshBusinesses } = useBusiness()
  const [page, setPage] = useState<BusinessPage | null>(null)
  const [links, setLinks] = useState<PageLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])
  const businessRepo = useMemo(() => new BusinessRepository(), [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      let pageData = await pageRepo.getByBusinessId(currentBusiness.id)
      if (!pageData) {
        pageData = await pageRepo.create(currentBusiness.id)
      }
      setPage(pageData)
      const linksData = await linkRepo.getByPageId(pageData.id)
      setLinks(linksData)
    } catch (err) {
      logError(err, 'Fetch Page Data')
      const normalized = parseError(err)
      toast.error('Erro ao carregar dados', { description: normalized.message })
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, pageRepo, linkRepo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!page) return
    setIsSaving(true)
    try {
      await pageRepo.update(page.id, { description: page.description })
      toast.success('Página atualizada!')
    } catch (err: unknown) {
      logError(err, 'Update Page Content')
      const normalized = parseError(err)
      toast.error('Erro ao salvar alterações', { description: normalized.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateLogo = async (url: string) => {
    if (!currentBusiness) return
    try {
      await businessRepo.update(currentBusiness.id, { logo_url: url })
      toast.success('Logo atualizado!')
      await refreshBusinesses()
    } catch (err: unknown) {
      logError(err, 'Update Logo')
      const normalized = parseError(err)
      toast.error('Erro ao atualizar logo', { description: normalized.message })
    }
  }

  const handleAddLink = async (type: string) => {
    if (!page) return
    const titles: Record<string, string> = {
      google_review: 'Avalie-nos no Google',
      whatsapp: 'Fale conosco no WhatsApp',
      instagram: 'Siga-nos no Instagram',
      facebook: 'Curta nossa página no Facebook',
      website: 'Visite nosso site',
      portfolio: 'Veja nosso portfólio',
      custom: 'Novo Link'
    }

    try {
      await linkRepo.create({
        page_id: page.id,
        type,
        title: titles[type] || 'Novo Link',
        url: '',
        sort_order: links.length
      })
      fetchData()
      toast.success('Link adicionado!')
    } catch (err: unknown) {
      logError(err, 'Add Link')
      const normalized = parseError(err)
      toast.error('Erro ao adicionar link', { description: normalized.message })
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Tem certeza?')) return
    try {
      await linkRepo.delete(id)
      setLinks(links.filter(l => l.id !== id))
      toast.success('Link removido')
    } catch (err: unknown) {
      logError(err, 'Delete Link')
      const normalized = parseError(err)
      toast.error('Erro ao remover link', { description: normalized.message })
    }
  }

  const handleUpdateLink = async (id: string, updates: Partial<PageLink>) => {
    try {
      await linkRepo.update(id, updates)
      setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l))
    } catch (err: unknown) {
      logError(err, 'Update Link')
      const normalized = parseError(err)
      toast.error('Erro ao atualizar link', { description: normalized.message })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id)
      const newIndex = links.findIndex((item) => item.id === over.id)
      const newItems = arrayMove(links, oldIndex, newIndex)
      
      setLinks(newItems)

      // Update order in DB
      const updates = newItems.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }))
      
      try {
        await linkRepo.updateOrder(updates)
      } catch (err: unknown) {
        logError(err, 'Update Links Order')
        const normalized = parseError(err)
        toast.error('Erro ao salvar nova ordem', { description: normalized.message })
        fetchData() // Revert to DB state on error
      }
    }
  }

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-10 w-64 bg-muted rounded" />
    <div className="h-64 bg-muted rounded-xl" />
  </div>

  if (!currentBusiness || !page) {
    return <div className="p-12 text-center">Selecione uma empresa para começar.</div>
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor da Página Pública</h1>
          <p className="text-muted-foreground">
            Personalize a experiência que seus clientes terão ao ler seu NFC.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            render={
              <Link href={`/r/${currentBusiness.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Link>
            }
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Settings Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>Logo e cores da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-32">
                   <Label className="mb-2 block">Logo da Empresa</Label>
                   <ImageUpload 
                     value={currentBusiness.logo_url}
                     onChange={handleUpdateLogo}
                     onRemove={() => handleUpdateLogo('')}
                     folder="logos"
                   />
                </div>
                <div className="flex-1 space-y-4">
                   <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-sm text-muted-foreground italic">
                     A logo será exibida no topo da sua página pública e também pode ser impressa em seus materiais.
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Página</CardTitle>
              <CardDescription>Informações básicas que aparecem no topo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePage} className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição da Empresa</Label>
                  <Textarea 
                    placeholder="Conte um pouco sobre seu negócio..."
                    value={page.description || ''}
                    onChange={(e) => setPage({ ...page, description: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Conteúdo'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Links e Botões (CTAs)</h2>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-2 text-sm font-medium transition-colors">
                    <Plus className="h-4 w-4" />
                    Adicionar Link
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('google_review')}>
                      <Star className="mr-2 h-4 w-4" /> Avaliação Google
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('whatsapp')}>
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('instagram')}>
                      <Camera className="mr-2 h-4 w-4" /> Instagram
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('facebook')}>
                      <Share2 className="mr-2 h-4 w-4" /> Facebook
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('website')}>
                      <Globe className="mr-2 h-4 w-4" /> Website
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('portfolio')}>
                      <Briefcase className="mr-2 h-4 w-4" /> Portfólio
                    </button>
                  } />
                  <DropdownMenuItem render={
                    <button className="w-full flex items-center cursor-pointer" onClick={() => handleAddLink('custom')}>
                      <LinkIcon className="mr-2 h-4 w-4" /> Link Personalizado
                    </button>
                  } />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              {links.length === 0 ? (
                <div className="p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
                  Nenhum link adicionado. Clique no botão acima para começar.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={links.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {links.map((link) => (
                        <SortableLinkItem
                          key={link.id}
                          link={link}
                          onDelete={handleDeleteLink}
                          onUpdate={handleUpdateLink}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="hidden md:block">
          <div className="sticky top-24 border-8 border-muted rounded-[3rem] h-[600px] w-full overflow-hidden shadow-2xl bg-background">
            <div className="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">
              <div className="w-16 h-1 bg-muted-foreground/20 rounded-full mb-8 shrink-0" />
              
              {currentBusiness.logo_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 mb-4 shrink-0 shadow-sm bg-background">
                  <Image 
                    src={currentBusiness.logo_url} 
                    alt={currentBusiness.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 shrink-0 border-2 border-primary/20 shadow-sm">
                  <span className="text-2xl font-bold text-primary">
                    {currentBusiness.name.substring(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
              
              <h3 className="font-bold text-lg mb-1 text-center">{currentBusiness.name}</h3>
              <p className="text-[10px] text-muted-foreground mb-6 line-clamp-2 text-center px-4 leading-relaxed">
                {page.description || 'Sua descrição aparecerá aqui...'}
              </p>
              
              <div className="w-full space-y-3">
                {links.map(l => (
                  <div key={l.id} className="w-full h-12 rounded-lg border bg-card flex items-center px-4 gap-3 text-xs font-medium shadow-sm transition-all hover:bg-accent/50">
                    <div className="h-6 w-6 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-3 w-3 text-primary" />
                    </div>
                    <span className="truncate">{l.title || 'Novo Link'}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8 pb-4">
                <p className="text-[8px] text-muted-foreground opacity-50 uppercase tracking-widest font-bold">
                  Avalia Prudente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
