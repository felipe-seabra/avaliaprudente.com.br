'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Review } from '@/core/domain/entities'
import { toast } from 'sonner'
import { Loader2, Reply, Trash2 } from 'lucide-react'

interface ReviewResponseDialogProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewResponseDialog({
  review,
  isOpen,
  onClose,
  onSuccess,
}: ReviewResponseDialogProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isEditing = !!review?.response_content

  useEffect(() => {
    if (review?.response_content) {
      setContent(review.response_content)
    } else {
      setContent('')
    }
  }, [review])

  const handleSubmit = async () => {
    if (!review) return
    if (!content.trim()) {
      toast.error('A resposta não pode estar vazia.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}/response`, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar resposta')
      }

      toast.success(isEditing ? 'Resposta atualizada!' : 'Resposta enviada com sucesso!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar resposta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!review) return
    if (!confirm('Tem certeza que deseja remover esta resposta oficial?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}/response`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao remover resposta')
      }

      toast.success('Resposta oficial removida.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover resposta')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Reply className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Resposta Oficial' : 'Responder Avaliação'}
          </DialogTitle>
          <DialogDescription>
            Sua resposta será exibida publicamente abaixo da avaliação do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg text-sm italic border-l-4 border-primary/20">
            &quot;{review?.feedback || 'Avaliação sem comentário'}&quot;
            <p className="mt-1 text-[10px] text-muted-foreground not-italic font-bold">
              — {review?.display_name || 'Cliente'}
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Escreva sua resposta aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={4000}
            />
            <p className="text-[10px] text-right text-muted-foreground">
              {content.length}/4000 caracteres
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          {isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remover
            </Button>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading || isDeleting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || isDeleting} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Enviar Resposta'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
