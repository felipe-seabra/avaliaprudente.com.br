'use client'

import React, { useState } from 'react'
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Business } from '@/core/domain/entities'

const settingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido'),
})

type SettingsInput = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { currentBusiness, refreshBusinesses } = useBusiness()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const repository = new BusinessRepository()

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      name: currentBusiness?.name || '',
      slug: currentBusiness?.slug || '',
    },
  })

  async function onSubmit(data: SettingsInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      if (data.slug !== currentBusiness.slug) {
        const existing = await repository.getBySlug(data.slug)
        if (existing) {
          form.setError('slug', { message: 'Este slug já está em uso' })
          return
        }
      }

      await repository.update(currentBusiness.id, data)
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

  async function onDeleteBusiness() {
    if (!currentBusiness) return
    setIsDeleting(true)
    try {
      // Database Deletion (Repo handles storage cleanup automatically)
      await repository.delete(currentBusiness.id)
      
      toast.success('Empresa excluída permanentemente.')
      setIsDialogOpen(false)
      
      // Refresh State
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
              <InputField
                name="slug"
                label="Slug (URL amigável)"
                placeholder="ex: pizzaria-do-joao"
                disabled={true}
                description="O link da sua empresa é permanente para evitar a quebra de QR Codes e tags NFC já impressas."
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
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
