'use client'

import { useEffect, useState, useMemo } from 'react'
import { BusinessPage, PageLink, Review } from '@/core/domain/entities'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { logError } from '@/lib/error-handler'

export function useBusinessPage(slug: string) {
  const [data, setData] = useState<{
    page: BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string } }
    links: PageLink[]
    reviews: Review[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageRepo = useMemo(() => new BusinessPageRepository(), [])
  const linkRepo = useMemo(() => new PageLinkRepository(), [])
  const reviewRepo = useMemo(() => new ReviewRepository(), [])
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(`🔍 Resolving public page for slug: ${slug}`)
        const page = await pageRepo.getBySlug(slug)
        
        if (!page) {
          console.error(`❌ Business not found for slug: ${slug}`)
          setError('Página não encontrada')
          return
        }

        console.log(`✅ Business resolved: ${page.businesses.name} (${page.business_id})`)

        const [links, reviews] = await Promise.all([
          linkRepo.getByPageId(page.id),
          reviewRepo.getByBusinessId(page.business_id)
        ])

        setData({ page, links, reviews })

        // Track visit (silently to not break the page if analytics fails)
        try {
          const urlParams = new URLSearchParams(window.location.search)
          const source = urlParams.get('utm_source') || urlParams.get('s') || 'direct'
          
          analyticsRepo.track({
            business_id: page.business_id,
            page_id: page.id,
            event_type: 'page_visit',
            source,
          })
        } catch (trackErr) {
          logError(trackErr, 'Analytics Track Page Visit')
        }
      } catch (err: unknown) {
        logError(err, 'useBusinessPage fetchData')
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug, pageRepo, linkRepo, reviewRepo, analyticsRepo])

  return { data, isLoading, error }
}
