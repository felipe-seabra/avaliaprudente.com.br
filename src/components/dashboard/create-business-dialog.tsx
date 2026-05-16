'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

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

const createBusinessSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  logo_url: z.string().optional(),
})

type CreateBusinessInput = z.infer<typeof createBusinessSchema>

export function CreateBusinessDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { refreshBusinesses, setCurrentBusiness } = useBusiness()
  const repository = new BusinessRepository()

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
  React.useEffect(() => {
    if (name && !form.formState.touchedFields.slug) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      form.setValue('slug', slug)
    }
  }, [name, form])

  async function onSubmit(data: CreateBusinessInput) {
    setIsLoading(true)
    try {
      // Check if slug exists
      const existing = await repository.getBySlug(data.slug)
      if (existing) {
        form.setError('slug', { message: 'Este slug já está em uso' })
        return
      }

      const newBusiness = await repository.create(data)
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

  const trigger = children ? (
    <>{children}</>
  ) : (
    <Button variant="outline" size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Nova Empresa
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Empresa</DialogTitle>
          <DialogDescription>
            Adicione uma nova empresa para gerenciar suas avaliações.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <InputField
                  name="slug"
                  label="Slug (URL amigável)"
                  placeholder="ex: pizzaria-do-joao"
                  disabled={isLoading}
                  description="Link: avaliaprudente.com.br/r/seu-slug"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Empresa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
