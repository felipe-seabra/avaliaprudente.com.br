'use client'

import React, { useMemo, useState } from 'react'
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
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { useBusiness } from '@/providers/business-provider'
import { parseError, logError } from '@/lib/error-handler'
import { isValidGoogleReviewUrl } from '@/lib/utils'
import { GoogleReviewTutorial } from './google-review-tutorial'

const createReviewLinkSchema = z.object({
  title: z.string().min(2, 'O texto deve ter pelo menos 2 caracteres'),
  url: z.string().url('URL inválida. Comece com https://').refine(isValidGoogleReviewUrl, 'O link deve ser um link válido de avaliações do Google'),
})

type CreateReviewLinkInput = z.infer<typeof createReviewLinkSchema>

export function CreateReviewLinkDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { currentBusiness } = useBusiness()
  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])

  const form = useForm<CreateReviewLinkInput>({
    resolver: zodResolver(createReviewLinkSchema),
    defaultValues: {
      title: 'Nos Avalie no Google',
      url: '',
    },
  })

  // Load existing Google link if available
  React.useEffect(() => {
    if (!open || !currentBusiness) return

    const loadExisting = async () => {
      try {
        const page = await pageRepo.getByBusinessId(currentBusiness.id)
        if (page) {
          const links = await linkRepo.getByPageId(page.id)
          const googleLink = links.find(l => l.type === 'google_review')
          if (googleLink) {
            form.reset({
              title: googleLink.title,
              url: googleLink.url
            })
          }
        }
      } catch (err) {
        console.error('Error loading existing review link:', err)
      }
    }

    loadExisting()
  }, [open, currentBusiness, pageRepo, linkRepo, form])

  async function onSubmit(data: CreateReviewLinkInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      let page = await pageRepo.getByBusinessId(currentBusiness.id)
      if (!page) {
        page = await pageRepo.create(currentBusiness.id)
      }

      const existingLinks = await linkRepo.getByPageId(page.id)
      const existingGoogleLink = existingLinks.find(l => l.type === 'google_review')

      if (existingGoogleLink) {
        await linkRepo.update(existingGoogleLink.id, {
          title: data.title,
          url: data.url
        })
      } else {
        await linkRepo.create({
          page_id: page.id,
          type: 'google_review',
          title: data.title,
          url: data.url,
          sort_order: -1 // Always at top
        })
      }

      // Requirement: Auto-activate public profile
      if (page && !page.is_published) {
        await pageRepo.update(page.id, { is_published: true })
        toast.success('Botão configurado e página ativada!', {
          description: 'Sua empresa agora está visível para o público.'
        })
      } else {
        toast.success('Botão de avaliação salvo com sucesso!')
      }

      setOpen(false)
      onCreated?.()
    } catch (error: unknown) {
      logError(error, 'Manage Review Button')
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
            Configurar Botão
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Botão de Avaliação</DialogTitle>
          <DialogDescription>
            Crie ou atualize o botão que levará seus clientes ao Google.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="title"
              label="Chamada para ação (Texto do botão)"
              placeholder="ex: Nos Avalie no Google"
              disabled={isLoading}
              description="Este texto aparecerá no botão que seus clientes verão."
            />
            <InputField
              name="url"
              label="Link da sua Página de Avaliações"
              placeholder="https://g.page/r/..."
              disabled={isLoading}
              description="Cole aqui o link direto onde o cliente deixa o comentário no Google."
            />

            <GoogleReviewTutorial />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Botão'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
