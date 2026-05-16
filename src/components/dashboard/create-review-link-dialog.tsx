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
import { Form } from '@/components/ui/form'
import { InputField } from '@/components/shared/input-field'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { useBusiness } from '@/providers/business-provider'
import { parseError, logError } from '@/lib/error-handler'

const createReviewLinkSchema = z.object({
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  redirect_url: z.string().url('URL inválida. Comece com https://'),
})

type CreateReviewLinkInput = z.infer<typeof createReviewLinkSchema>

export function CreateReviewLinkDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { currentBusiness } = useBusiness()
  const repository = new ReviewLinkRepository()

  const form = useForm<CreateReviewLinkInput>({
    resolver: zodResolver(createReviewLinkSchema),
    defaultValues: {
      slug: '',
      redirect_url: '',
    },
  })

  async function onSubmit(data: CreateReviewLinkInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      await repository.create({
        ...data,
        business_id: currentBusiness.id,
      })
      toast.success('Link criado com sucesso!')
      setOpen(false)
      form.reset()
      onCreated?.()
    } catch (error: unknown) {
      logError(error, 'Create Review Link')
      const normalized = parseError(error)
      toast.error(normalized.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Link
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Link de Redirecionamento</DialogTitle>
          <DialogDescription>
            Crie um link personalizado que redireciona seus clientes satisfeitos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="slug"
              label="Slug do Link"
              placeholder="ex: restaurante-principal"
              disabled={isLoading}
              description="O link será: avaliaprudente.com.br/r/seu-slug"
            />
            <InputField
              name="redirect_url"
              label="URL do Google Meu Negócio"
              placeholder="https://g.page/r/..."
              disabled={isLoading}
              description="Cole aqui o link direto da sua página de avaliações no Google."
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Link'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
