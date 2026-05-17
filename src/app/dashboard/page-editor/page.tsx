'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { AdminRepository } from '@/core/infrastructure/repositories/supabase-admin-repository'
import { BusinessPage, PageLink, Business } from '@/core/domain/entities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Plus, 
  Eye, 
  Save,
  Globe,
  Briefcase,
  Link as LinkIcon,
  ChevronRight,
  ShieldCheck,
  Clock,
  ShieldAlert,
  Loader2
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
import { VerificationRequestModal } from '@/components/dashboard/verification-request-modal'
import { parseError, logError } from '@/lib/error-handler'
import { BrandIcons } from '@/components/shared/brand-icons'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function PageEditor() {
  const { currentBusiness, refreshBusinesses } = useBusiness()
  const [page, setPage] = useState<BusinessPage | null>(null)
  const [links, setLinks] = useState<PageLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'customer'>('customer')
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false)

  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])
  const businessRepo = useMemo(() => new BusinessRepository(), [])
  const adminRepo = useMemo(() => new AdminRepository(), [])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile) setUserRole(profile.role)
      }
    }
    getRole()
  }, [supabase])

  useEffect(() => {
    if (currentBusiness?.logo_url) {
      setLocalLogoUrl(currentBusiness.logo_url)
    } else {
      setLocalLogoUrl(null)
    }
  }, [currentBusiness?.logo_url])

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
    setLocalLogoUrl(url) // Optimistic update
    try {
      await businessRepo.update(currentBusiness.id, { logo_url: url })
      if (!url) toast.success('Logo removido com sucesso.')
      await refreshBusinesses()
    } catch (err: unknown) {
      logError(err, 'Update Logo')
      setLocalLogoUrl(currentBusiness.logo_url) // Rollback
      const normalized = parseError(err)
      toast.error('Erro ao atualizar logo', { description: normalized.message })
    }
  }

  const handleAdminVerify = async () => {
    if (!currentBusiness) return
    setIsAdminActionLoading(true)
    try {
      await adminRepo.verifyBusiness(currentBusiness.id)
      toast.success('Empresa verificada instantaneamente!')
      await refreshBusinesses()
    } catch (err) {
      logError(err, 'Admin Verify')
      toast.error('Erro ao verificar empresa')
    } finally {
      setIsAdminActionLoading(false)
    }
  }

  const handleAdminUnverify = async () => {
    if (!currentBusiness) return
    if (!confirm('Tem certeza que deseja remover a verificação?')) return
    setIsAdminActionLoading(true)
    try {
      await adminRepo.removeBusinessVerification(currentBusiness.id)
      toast.success('Verificação removida.')
      await refreshBusinesses()
    } catch (err) {
      logError(err, 'Admin Unverify')
      toast.error('Erro ao remover verificação')
    } finally {
      setIsAdminActionLoading(false)
    }
  }

  const handleAddLink = async (type: string) => {
    if (!page) return
    const titles: Record<string, string> = {
      google_review: 'Avalie-nos no Google',
      whatsapp: 'Fale conosco no WhatsApp',
      instagram: 'Siga-nos no Instagram',
      facebook: 'Curta nossa página no Facebook',
      tiktok: 'Siga-nos no TikTok',
      youtube: 'Inscreva-se no YouTube',
      linkedin: 'Conecte-se no LinkedIn',
      twitter: 'Siga-nos no X',
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

  const getPreviewIcon = (link: PageLink) => {
    const type = link.type.toLowerCase()
    const url = (link.url || '').toLowerCase()

    if (type === 'google_review') return <BrandIcons.Google size={14} className="text-[#4285F4]" />
    if (type === 'whatsapp' || url.includes('wa.me')) return <BrandIcons.WhatsApp size={16} className="text-[#25D366]" />
    if (type === 'instagram' || url.includes('instagram.com')) return <BrandIcons.Instagram size={14} className="text-[#E4405F]" />
    if (type === 'facebook' || url.includes('facebook.com')) return <BrandIcons.Facebook size={14} className="text-[#1877F2]" />
    if (type === 'tiktok' || url.includes('tiktok.com')) return <BrandIcons.TikTok size={14} className="text-foreground" />
    if (type === 'youtube' || url.includes('youtube.com')) return <BrandIcons.YouTube size={14} className="text-[#FF0000]" />
    if (type === 'linkedin' || url.includes('linkedin.com')) return <BrandIcons.LinkedIn size={14} className="text-[#0A66C2]" />
    if (type === 'twitter' || type === 'x' || url.includes('x.com')) return <BrandIcons.Twitter size={12} className="text-foreground" />
    
    return <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
  }

  if (isLoading) return <div className="p-8 animate-pulse space-y-4">
    <div className="h-10 w-64 bg-muted rounded" />
    <div className="h-64 bg-muted rounded-xl" />
  </div>

  if (!currentBusiness || !page) {
    return <div className="p-12 text-center">Selecione uma empresa para começar.</div>
  }

  const biz = currentBusiness as Business
  const isVerified = biz.is_verified
  const verificationStatus = biz.verification_status
  const isAdmin = userRole === 'admin'

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
            className="cursor-pointer"
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
          <Card className={cn(isVerified ? "border-blue-500/20 bg-blue-500/5" : "border-primary/10 bg-primary/5")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={cn("h-5 w-5", isVerified ? "text-blue-500" : "text-primary")} />
                  <CardTitle className="text-lg">Status de Verificação</CardTitle>
                </div>
                {isVerified ? (
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <ShieldCheck className="h-3 w-3" /> Verificado
                   </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest border">
                      {verificationStatus === 'rejected' ? 'Não Aprovado' : 'Não Verificado'}
                  </div>
                )}
              </div>
              <CardDescription>
                {isVerified 
                  ? "Sua empresa possui o selo oficial de confiança da Avalia Prudente."
                  : "Aumente a confiança dos seus clientes solicitando o selo oficial de verificação."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <ShieldAlert className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                         <p className="text-sm font-bold">Controle de Administrador</p>
                         <p className="text-xs text-muted-foreground">Você pode alterar o status instantaneamente.</p>
                      </div>
                   </div>
                   <Button 
                     size="sm" 
                     variant={isVerified ? "destructive" : "default"}
                     className="font-bold gap-2 cursor-pointer"
                     onClick={isVerified ? handleAdminUnverify : handleAdminVerify}
                     disabled={isAdminActionLoading}
                   >
                     {isAdminActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                     {isVerified ? "Remover Verificação" : "Verificar Agora"}
                   </Button>
                </div>
              )}

              {!isVerified ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground max-w-sm">
                    {verificationStatus === 'rejected' 
                      ? "Sua última solicitação não foi aprovada. Certifique-se de que seu perfil está completo e tente novamente."
                      : "Para ser verificado, sua empresa deve ter nome, logo e pelo menos 3 links ativos."}
                  </div>
                  <Button 
                    onClick={() => setIsVerificationModalOpen(true)}
                    disabled={verificationStatus === 'pending'}
                    className="font-bold gap-2 cursor-pointer w-full sm:w-auto"
                    variant={verificationStatus === 'rejected' ? "outline" : "default"}
                  >
                    {verificationStatus === 'pending' ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Aguardando Análise...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Solicitar Selo
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-blue-700/70 font-medium">
                  Seu selo está ativo e visível para todos os clientes em sua página pública e nos rankings.
                </div>
              )}
            </CardContent>
          </Card>

          <VerificationRequestModal 
            businessId={currentBusiness.id}
            businessName={currentBusiness.name}
            isVerified={isVerified}
            open={isVerificationModalOpen}
            onOpenChange={setIsVerificationModalOpen}
          />

          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>Logo e cores da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-40 shrink-0">
                   <Label className="mb-3 block font-bold text-xs uppercase tracking-widest text-muted-foreground">Logo da Empresa</Label>
                   <ImageUpload 
                     value={localLogoUrl}
                     onChange={handleUpdateLogo}
                     onRemove={() => handleUpdateLogo('')}
                     folder="logos"
                   />
                </div>
                <div className="flex-1 space-y-4">
                   <div className="p-5 bg-muted/40 rounded-3xl border-2 border-dashed border-border/60 text-sm text-muted-foreground italic leading-relaxed">
                     A logo será exibida no topo da sua página pública e também é usada para gerar as imagens de compartilhamento (OpenGraph) no WhatsApp e redes sociais.
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-background border shadow-sm">
                         <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Resolução</p>
                         <p className="text-xs font-bold">512 x 512px</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border shadow-sm">
                         <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Formato</p>
                         <p className="text-xs font-bold">PNG ou WebP</p>
                      </div>
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
                <Button type="submit" disabled={isSaving} className="cursor-pointer font-bold gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Conteúdo'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gradient">Links e Botões (CTAs)</h2>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="h-9 px-3 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-2 text-sm font-medium transition-colors cursor-pointer outline-none">
                      <Plus className="h-4 w-4" />
                      Adicionar Link
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('google_review')}>
                    <BrandIcons.Google className="mr-2 h-4 w-4 text-[#4285F4]" /> Avaliação Google
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('whatsapp')}>
                    <BrandIcons.WhatsApp className="mr-2 h-4 w-4 text-[#25D366]" /> WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('instagram')}>
                    <BrandIcons.Instagram className="mr-2 h-4 w-4 text-[#E4405F]" /> Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('facebook')}>
                    <BrandIcons.Facebook className="mr-2 h-4 w-4 text-[#1877F2]" /> Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('tiktok')}>
                    <BrandIcons.TikTok className="mr-2 h-4 w-4" /> TikTok
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('youtube')}>
                    <BrandIcons.YouTube className="mr-2 h-4 w-4 text-[#FF0000]" /> YouTube
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('linkedin')}>
                    <BrandIcons.LinkedIn className="mr-2 h-4 w-4 text-[#0A66C2]" /> LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('twitter')}>
                    <BrandIcons.Twitter className="mr-2 h-4 w-4" /> Twitter / X
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('website')}>
                    <Globe className="mr-2 h-4 w-4 text-primary" /> Website
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('portfolio')}>
                    <Briefcase className="mr-2 h-4 w-4 text-primary" /> Portfólio
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddLink('custom')}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Link Personalizado
                  </DropdownMenuItem>
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
          <div className="sticky top-24 border-8 border-muted rounded-[3rem] h-[600px] w-full overflow-hidden shadow-2xl bg-muted/30">
            <div className="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col items-center bg-background/50">
              <div className="w-16 h-1.5 bg-muted-foreground/20 rounded-full mb-10 shrink-0" />
              
              {localLogoUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/10 mb-5 shrink-0 shadow-lg bg-background animate-in zoom-in duration-300">
                  <Image 
                    src={localLogoUrl} 
                    alt={currentBusiness.name} 
                    fill 
                    className="object-cover"
                    key={localLogoUrl} // Force refresh on URL change
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-5 shrink-0 border-2 border-primary/10 shadow-lg animate-in zoom-in duration-300">
                  <span className="text-3xl font-bold text-primary">
                    {currentBusiness.name.substring(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
              
              <h3 className="font-extrabold text-xl mb-2 text-center tracking-tight">{currentBusiness.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-8 line-clamp-3 text-center px-4 leading-relaxed font-medium">
                {page.description || 'Sua descrição aparecerá aqui...'}
              </p>
              
              <div className="w-full space-y-3">
                {links.map(l => (
                  <div key={l.id} className="w-full h-14 rounded-2xl border-2 bg-background flex items-center px-4 gap-4 text-[13px] font-bold shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/50">
                      {getPreviewIcon(l)}
                    </div>
                    <span className="truncate flex-1">{l.title || 'Novo Link'}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-12 pb-4 flex flex-col items-center gap-1">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] font-black">
                  Avalia Prudente
                </p>
                <div className="h-0.5 w-4 bg-primary/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
