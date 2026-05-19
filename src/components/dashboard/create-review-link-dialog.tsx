'use client'

import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Loader2, CheckCircle2, XCircle } from 'lucide-react'

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
import { isValidGoogleReviewUrl } from '@/lib/utils'
import { GoogleReviewTutorial } from './google-review-tutorial'

const createReviewLinkSchema = z.object({
  slug: z.string().min(2, 'O texto deve ter pelo menos 2 caracteres'),
  redirect_url: z.string().url('URL inválida. Comece com https://').refine(isValidGoogleReviewUrl, 'O link deve ser um link válido de avaliações do Google'),
})

type CreateReviewLinkInput = z.infer<typeof createReviewLinkSchema>

export function CreateReviewLinkDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'available' | 'unavailable' | 'idle'>('idle')
  const { currentBusiness } = useBusiness()
  const repository = useMemo(() => new ReviewLinkRepository(), [])

  const form = useForm<CreateReviewLinkInput>({
    resolver: zodResolver(createReviewLinkSchema),
    defaultValues: {
      slug: 'Nos Avalie no Google',
      redirect_url: '',
    },
  })

  const watchedSlug = form.watch('slug')

  // Real-time label validation (checking for uniqueness)
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
        console.error('Error checking label availability:', error)
      } finally {
        setIsCheckingSlug(false)
      }
    }

    const timer = setTimeout(checkSlug, 500)
    return () => clearTimeout(timer)
  }, [watchedSlug, repository])

  async function onSubmit(data: CreateReviewLinkInput) {
    if (!currentBusiness) return
    setIsLoading(true)
    try {
      const available = await repository.isSlugAvailable(data.slug)
      if (!available) {
        form.setError('slug', { message: 'Este texto já está em uso para outro botão' })
        return
      }

      await repository.create({
        ...data,
        business_id: currentBusiness.id,
      })

      // Requirement: Encourage/Auto-activate public profile if this is the first Google link
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: page } = await supabase.from('business_pages').select('id, is_published').eq('business_id', currentBusiness.id).maybeSingle()
      
      if (page && !page.is_published) {
        await supabase.from('business_pages').update({ is_published: true }).eq('id', page.id)
        toast.success('Link criado e página ativada!', {
          description: 'Sua empresa agora está visível para o público.'
        })
      } else {
        toast.success('Link criado com sucesso!')
      }

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
          <DialogTitle>Novo Botão de Avaliação</DialogTitle>
          <DialogDescription>
            Crie uma chamada para ação que redireciona seus clientes para sua página no Google.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <InputField
                name="slug"
                label="Chamada para ação (Texto do botão)"
                placeholder="ex: Nos Avalie no Google"
                disabled={isLoading}
                description="Este texto aparecerá no botão que seus clientes verão."
              />
              <div className="absolute top-9 right-3 flex items-center gap-2">
                {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!isCheckingSlug && slugStatus === 'available' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {!isCheckingSlug && slugStatus === 'unavailable' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <InputField
              name="redirect_url"
              label="Link da sua Página de Avaliações"
              placeholder="https://g.page/r/..."
              disabled={isLoading}
              description="Cole aqui o link direto onde o cliente deixa o comentário."
            />

            <GoogleReviewTutorial />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isCheckingSlug || slugStatus === 'unavailable'}>
                {isLoading ? 'Criando...' : 'Criar Botão'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
