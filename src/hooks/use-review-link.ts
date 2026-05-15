'use client'

import { useEffect, useState, useMemo } from 'react'
import { ReviewLink, Business } from '@/core/domain/entities'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'

export function useReviewLink(slug: string) {
  const [link, setReviewLink] = useState<(ReviewLink & { businesses: Business }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const repository = useMemo(() => new ReviewLinkRepository(), [])

  useEffect(() => {
    async function fetchLink() {
      try {
        const data = await repository.getBySlug(slug)
        if (!data) {
          setError('Link não encontrado ou inativo')
        } else {
          setReviewLink(data as unknown as (ReviewLink & { businesses: Business }))
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchLink()
    }
  }, [slug, repository])

  return { link, isLoading, error }
}
