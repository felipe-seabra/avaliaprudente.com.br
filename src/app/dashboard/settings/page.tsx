'use client'

import React, { useMemo, useState } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/shared/input-field'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { parseError, logError } from '@/lib/error-handler'
import { isValidSlug } from '@/lib/utils'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2, ShieldCheck, Loader2, CheckCircle2, XCircle, Wand2 } from 'lucide-react'
import { Business } from '@/core/domain/entities'
import { VerificationRequestModal } from '@/components/dashboard/verification-request-modal'

const settingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').refine(isValidSlug, 'Slug inválido ou reservado'),
})

type SettingsInput = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { currentBusiness, refreshBusinesses } = useBusiness()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'available' | 'unavailable' | 'idle'>('idle')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const repository = useMemo(() => new BusinessRepository(), [])

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: currentBusiness?.name || '',
      slug: currentBusiness?.slug || '',
    },
  })

  const watchedSlug = form.watch('slug')

  // Real-time slug validation
  React.useEffect(() => {
    const checkSlug = async () => {
      if (!watchedSlug || watchedSlug.length < 2 || !currentBusiness) {
        setSlugStatus('idle')
        return
      }

      if (watchedSlug === currentBusiness.slug) {
        setSlugStatus('available')
        return
      }

      setIsCheckingSlug(true)
      try {
        const available = await repository.isSlugAvailable(watchedSlug, currentBusiness.id)
        setSlugStatus(available ? 'available' : 'unavailable')
      } catch (error) {
        console.error('Error checking slug:', error)
      } finally {
        setIsCheckingSlug(false)
      }
    }

    const timer = setTimeout(checkSlug, 500)
    return () => clearTimeout(timer)
  }, [watchedSlug, currentBusiness, repository])

  async function onSubmit(data: SettingsInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      if (data.slug !== currentBusiness.slug) {
        const available = await repository.isSlugAvailable(data.slug, currentBusiness.id)
        if (!available) {
          const suggested = await repository.getAvailableSlug(data.slug, currentBusiness.id)
          form.setError('slug', { message: 'Este slug já está em uso' })
          toast.error('Slug indisponível', {
            description: `Que tal usar "${suggested}"?`
          })
          return
        }
      }

      await repository.update(currentBusiness.id, {
        ...data,
        slug: data.slug.toLowerCase()
      })
      toast.success('Configurações salvas com sucesso!')
      await refreshBusinesses()
    } catch (error: unknown) {
      logError(error, 'Update Business Settings')
      const normalized = parseError(error)
      toast.error('Erro ao salvar configurações', { description: normalized.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggest = async () => {
    if (!watchedSlug || !currentBusiness) return
    setIsCheckingSlug(true)
    try {
      const suggested = await repository.getAvailableSlug(watchedSlug, currentBusiness.id)
      form.setValue('slug', suggested, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    } finally {
      setIsCheckingSlug(false)
    }
  }

  async function onDeleteBusiness() {
    if (!currentBusiness) return
    setIsDeleting(true)
    try {
      await repository.delete(currentBusiness.id)
      toast.success('Empresa excluída permanentemente.')
      setIsDialogOpen(false)
      await refreshBusinesses()
    } catch (error: unknown) {
      logError(error, 'Delete Business')
      const normalized = parseError(error)
      toast.error('Erro ao excluir empresa', { description: normalized.message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
      </div>
    )
  }

  const hasNfcTag = (currentBusiness as Business & { has_nfc_tag?: boolean }).has_nfc_tag || false
  const isVerified = (currentBusiness as Business & { is_verified?: boolean }).is_verified || false
  const isSlugChanged = watchedSlug !== currentBusiness.slug

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
        <p className="text-muted-foreground">
          Gerencie as informações básicas de {currentBusiness.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Estas informações são usadas para identificar sua empresa na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                name="name"
                label="Nome da Empresa"
                placeholder="Ex: Pizzaria do João"
                disabled={isLoading}
              />
              <div className="relative">
                <InputField
                  name="slug"
                  label="Slug (URL amigável)"
                  placeholder="ex: pizzaria-do-joao"
                  disabled={isLoading}
                  description="Atenção: Mudar o slug invalidará QR Codes e tags NFC já impressos."
                />
                <div className="absolute top-9 right-3 flex items-center gap-2">
                  {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isCheckingSlug && slugStatus === 'available' && watchedSlug !== currentBusiness.slug && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {!isCheckingSlug && slugStatus === 'unavailable' && (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary hover:text-primary-foreground hover:bg-primary"
                        onClick={handleSuggest}
                        title="Sugerir disponível"
                      >
                        <Wand2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {isSlugChanged && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Aviso importante:</strong> Ao alterar o slug, o link anterior deixará de funcionar imediatamente. Certifique-se de que não há materiais impressos (adesivos, cartões, tags NFC) usando o link antigo.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || isCheckingSlug || (isSlugChanged && slugStatus === 'unavailable')} 
                  className="cursor-pointer font-bold"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-primary/10 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
             <ShieldCheck className="h-5 w-5" />
             <CardTitle className="text-lg">Selo Verificado</CardTitle>
          </div>
          <CardDescription>
            Aumente a confiança dos seus clientes com o selo oficial de verificação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-foreground">Status da Verificação</p>
            <p className="text-sm text-muted-foreground">
              {isVerified 
                ? 'Sua empresa está verificada e exibe o selo oficial.' 
                : 'Sua empresa ainda não possui o selo de verificação oficial.'}
            </p>
          </div>
          <Button 
            variant={isVerified ? "outline" : "default"} 
            className="cursor-pointer font-bold shadow-sm"
            onClick={() => setIsVerificationModalOpen(true)}
          >
            {isVerified ? 'Ver Detalhes' : 'Solicitar Verificação'}
          </Button>

          <VerificationRequestModal 
            businessId={currentBusiness.id}
            businessName={currentBusiness.name}
            isVerified={isVerified}
            open={isVerificationModalOpen}
            onOpenChange={setIsVerificationModalOpen}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
        <CardHeader className="border-b border-destructive/10 pb-6">
          <div className="flex items-center gap-2 text-destructive">
             <AlertTriangle className="h-5 w-5" />
             <CardTitle className="text-lg">Zona de Perigo</CardTitle>
          </div>
          <CardDescription className="text-destructive/80 font-medium">
            Ações irreversíveis para sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-bold text-foreground">Excluir Empresa</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Isso excluirá permanentemente a empresa <strong>{currentBusiness.name}</strong>, todos os links, QR Codes, avaliações e dados analíticos associados.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" className="cursor-pointer font-bold shadow-sm shadow-destructive/20">
                    Excluir Empresa
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Confirmar Exclusão
                  </DialogTitle>
                  <DialogDescription className="pt-2 leading-relaxed text-sm">
                    {hasNfcTag ? (
                      <span className="text-destructive font-bold block mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        Esta empresa possui uma Tag NFC associada. Ao excluir a empresa, a Tag deixará de funcionar permanentemente.
                      </span>
                    ) : null}
                    Tem certeza que deseja excluir esta empresa? Esta ação <strong>não poderá ser desfeita</strong> e todos os links públicos e tags NFC deixarão de funcionar imediatamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 px-4 bg-destructive/5 rounded-lg border border-destructive/10">
                  <p className="text-xs text-destructive font-medium flex items-center gap-2 italic">
                    <AlertTriangle className="h-3 w-3" />
                    Atenção: Todos os dados serão removidos permanentemente.
                  </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isDeleting}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={onDeleteBusiness}
                    disabled={isDeleting}
                    className="cursor-pointer font-bold"
                  >
                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir Permanente'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
