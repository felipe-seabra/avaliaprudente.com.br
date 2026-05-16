'use client'

import { useEffect, useState, useMemo } from 'react'
import { BusinessPage, PageLink } from '@/core/domain/entities'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'

export function useBusinessPage(slug: string) {
  const [data, setData] = useState<{
    page: BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string } }
    links: PageLink[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  useEffect(() => {
    async function fetchData() {
      try {
        const page = await pageRepo.getBySlug(slug)
        if (!page) {
          setError('Página não encontrada')
          return
        }
        const links = await linkRepo.getByPageId(page.id)
        setData({ page, links })

        // Track visit
        const urlParams = new URLSearchParams(window.location.search)
        const source = urlParams.get('utm_source') || urlParams.get('s') || 'direct'
        
        analyticsRepo.track({
          business_id: page.business_id,
          page_id: page.id,
          event_type: 'page_visit',
          source,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug, pageRepo, linkRepo, analyticsRepo])

  return { data, isLoading, error }
}
