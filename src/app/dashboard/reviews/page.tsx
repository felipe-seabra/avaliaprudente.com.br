'use client'

import React, { useState } from 'react'
import { useBusiness } from '@/providers/business-provider'
import { Review } from '@/core/domain/entities'
import { ReputationBadge } from '@/components/shared/reputation-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare, Calendar, User, Reply, Edit3, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ReviewResponseDialog } from '@/components/dashboard/review-response-dialog'
import { Pagination } from '@/components/shared/pagination'
import { useReviews } from '@/hooks/use-dashboard-queries'

export default function ReviewsPage() {
  const { currentBusiness } = useBusiness()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const limit = 5
  const { data: reviewsData, isLoading, refetch } = useReviews(currentBusiness?.id, currentPage, limit)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRespond = (review: Review) => {
    setSelectedReview(review)
    setIsDialogOpen(true)
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-2xl font-bold">Nenhuma empresa selecionada</h1>
      </div>
    )
  }

  const reviews = reviewsData?.data || []
  const totalReviews = reviewsData?.total || 0
  const totalPages = Math.ceil(totalReviews / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avaliações e Feedbacks</h1>
        <p className="text-muted-foreground">
          Acompanhe o que seus clientes estão dizendo sobre <strong>{currentBusiness.name}</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20 mx-auto" />
            <p className="text-muted-foreground">Ainda não há avaliações registradas.</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className={cn(
              "overflow-hidden border-l-4",
              review.rating >= 4 ? "border-l-green-500" : "border-l-yellow-500"
            )}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={16} 
                            fill={s <= review.rating ? "currentColor" : "none"} 
                            className={s <= review.rating ? "text-yellow-400" : "text-muted"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {review.rating} {review.rating === 1 ? 'estrela' : 'estrelas'}
                      </span>
                      {review.is_internal && (
                        <span className="bg-blue-500/10 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          Feedback Interno
                        </span>
                      )}
                    </div>

                    {review.feedback && (
                      <p className="text-foreground leading-relaxed italic">
                        &quot;{review.feedback}&quot;
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {review.display_name || review.customer_name || 'Cliente Verificado'}
                      </div>

                      <ReputationBadge 
                        count={Number(review.author_review_count || 0)} 
                        role={review.author_role} 
                      />

                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(review.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Dashboard Response View */}
                    {review.response_content && (
                      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <Reply size={12} />
                          {review.response_author_role === 'customer' ? 'Sua resposta oficial' : 'Resposta da Equipe Avalia Prudente'}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic pl-2 border-l-2 border-primary/20">
                          &quot;{review.response_content}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Button 
                      variant={review.response_content ? "outline" : "default"}
                      size="sm"
                      className="gap-2"
                      onClick={() => handleRespond(review)}
                    >
                      {review.response_content ? (
                        <>
                          <Edit3 size={14} />
                          Editar Resposta
                        </>
                      ) : (
                        <>
                          <Reply size={14} />
                          Responder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!isLoading && reviews.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <ReviewResponseDialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedReview(null)
        }}
        review={selectedReview}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
