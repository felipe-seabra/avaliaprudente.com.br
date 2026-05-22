'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { StarRating } from '@/components/shared/star-rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Store, Trash2, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'

type Review = {
  id: string
  rating: number
  feedback: string | null
  created_at: string
  updated_at: string
  business_id: string
  businesses: {
    name: string
    slug: string
  } | null
}

export function ReviewList({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir avaliação')
      }

      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Avaliação excluída com sucesso.')
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível excluir a avaliação.')
    }
  }

  const handleEdit = (review: Review) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditFeedback(review.feedback || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRating(0)
    setEditFeedback('')
  }

  const handleSaveEdit = async (id: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: editRating,
          feedback: editFeedback,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar avaliação')
      }

      const updatedData = await response.json()

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, rating: editRating, feedback: editFeedback, updated_at: updatedData.updated_at }
            : r
        )
      )
      toast.success('Avaliação atualizada com sucesso.')
      setEditingId(null)
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível atualizar a avaliação.')
    } finally {
      setIsSaving(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Nenhuma avaliação encontrada</h3>
        <p className="text-muted-foreground mt-2">
          Você ainda não avaliou nenhuma empresa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isEditing = editingId === review.id
        const business = Array.isArray(review.businesses) ? review.businesses[0] : review.businesses

        return (
          <div key={review.id} className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href={`/${business?.slug || ''}`} className="text-lg font-bold hover:underline">
                  {business?.name || 'Empresa desconhecida'}
                </Link>
                <div className="text-xs text-muted-foreground mt-1">
                  Enviada em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(review.created_at))}
                  {review.updated_at !== review.created_at && (
                    <span className="ml-1 italic">(editada)</span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(review)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sua Nota</label>
                  <StarRating rating={editRating} onRatingChange={setEditRating} disabled={isSaving} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Seu Comentário</label>
                  <Textarea
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    disabled={isSaving}
                    className="min-h-[100px] resize-none"
                    placeholder="O que você achou do serviço?"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={() => handleSaveEdit(review.id)} disabled={isSaving || editRating === 0}>
                    <Check className="h-4 w-4 mr-2" /> Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <ReviewListStar
                      key={i}
                      filled={i < review.rating}
                      className="h-4 w-4 cursor-default"
                    />
                  ))}
                </div>
                {review.feedback && (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {review.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReviewListStar({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
ReviewListStar.displayName = 'ReviewListStar'
