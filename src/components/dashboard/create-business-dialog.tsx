'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, ShieldAlert, Sparkles, Loader2, CheckCircle2, XCircle, Wand2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { ImageUpload } from '@/components/shared/image-upload'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { useBusiness } from '@/providers/business-provider'
import { parseError, logError } from '@/lib/error-handler'
import { PRICING_PLANS, APP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { slugify, isValidSlug } from '@/lib/utils'

const createBusinessSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').refine(isValidSlug, 'Slug inválido ou reservado'),
  logo_url: z.string().optional(),
})

type CreateBusinessInput = z.infer<typeof createBusinessSchema>

export function CreateBusinessDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'available' | 'unavailable' | 'idle'>('idle')
  const [userRole, setUserRole] = useState('customer')
  const { businesses, refreshBusinesses, setCurrentBusiness } = useBusiness()
  const repository = useMemo(() => new BusinessRepository(), [])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setUserRole(profile.role)
      }
    }
    getRole()
  }, [supabase])

  const form = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo_url: '',
    },
  })

  // Auto-generate slug from name
  const name = form.watch('name')
  const watchedSlug = form.watch('slug')

  React.useEffect(() => {
    if (name && !form.formState.touchedFields.slug) {
      const generatedSlug = slugify(name)
      form.setValue('slug', generatedSlug)
    }
  }, [name, form])

  // Real-time slug validation
  React.useEffect(() => {
    const checkSlug = async () => {
      if (!watchedSlug || watchedSlug.length < 2) {
        setSlugStatus('idle')
        return
      }

      setIsCheckingSlug(true)
      try {
        const available = await repository.isSlugAvailable(watchedSlug)
        setSlugStatus(available ? 'available' : 'unavailable')
      } catch (error) {
        console.error('Error checking slug:', error)
      } finally {
        setIsCheckingSlug(false)
      }
    }

    const timer = setTimeout(checkSlug, 500)
    return () => clearTimeout(timer)
  }, [watchedSlug, repository])

  const canCreate = userRole === 'admin' || businesses.length < PRICING_PLANS.FREE.maxBusinesses

  async function onSubmit(data: CreateBusinessInput) {
    if (!canCreate) {
      toast.error('Limite de empresas atingido', {
        description: 'Você atingiu o limite do plano gratuito. Entre em contato para migrar para o plano Business.'
      })
      return
    }

    setIsLoading(true)
    try {
      // Final availability check
      const available = await repository.isSlugAvailable(data.slug)
      if (!available) {
        const suggested = await repository.getAvailableSlug(data.slug)
        form.setError('slug', { message: 'Este slug já está em uso' })
        toast.error('Slug indisponível', {
          description: `Que tal usar "${suggested}"?`
        })
        return
      }

      const newBusiness = await repository.create({
        ...data,
        slug: data.slug.toLowerCase()
      })
      toast.success('Empresa criada com sucesso!')
      await refreshBusinesses()
      setCurrentBusiness(newBusiness)
      setOpen(false)
      form.reset()
    } catch (error: unknown) {
      logError(error, 'Create Business')
      const normalized = parseError(error)
      toast.error(normalized.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggest = async () => {
    if (!watchedSlug) return
    setIsCheckingSlug(true)
    try {
      const suggested = await repository.getAvailableSlug(watchedSlug)
      form.setValue('slug', suggested, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const trigger = children ? (
    <>{children}</>
  ) : (
    <Button variant="outline" size="sm" className="gap-2 cursor-pointer shadow-sm hover:bg-primary/5">
      <Plus className="h-4 w-4" />
      Nova Empresa
    </Button>
  )

  const upgradeUrl = `https://wa.me/${APP_CONFIG.whatsappOrderNumber}?text=${encodeURIComponent('Olá! Gostaria de migrar para o plano Business para cadastrar mais empresas.')}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Cadastrar Nova Empresa
          </DialogTitle>
          <DialogDescription>
            Insira o nome da sua empresa e escolha um link curto para sua página.
          </DialogDescription>
        </DialogHeader>

        {!canCreate ? (
          <div className="py-6 space-y-4">
             <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
                <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-yellow-800">Limite Atingido</p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    No plano **Gratuito**, você pode gerenciar apenas {PRICING_PLANS.FREE.maxBusinesses} empresa.
                  </p>
                </div>
             </div>
             <Button className="w-full gap-2 font-bold cursor-pointer" onClick={() => window.open(upgradeUrl, '_blank')}>
                <Sparkles className="h-4 w-4" />
                Migrar para Business
             </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 shrink-0">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onRemove={() => field.onChange('')}
                            folder="logos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
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
                      description="Link: avaliaprudente.com.br/r/seu-slug"
                    />
                    <div className="absolute top-9 right-3 flex items-center gap-2">
                      {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!isCheckingSlug && slugStatus === 'available' && (
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
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer" disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isCheckingSlug || slugStatus === 'unavailable'} className="cursor-pointer font-bold">
                  {isLoading ? 'Criando...' : 'Criar Empresa'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
