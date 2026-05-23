import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'
import { TablesUpdate } from '@/types/supabase'
import { CreatePageLinkDTO } from '@/core/domain/entities'

const reviewRepo = new ReviewRepository()
const analyticsRepo = new AnalyticsRepository()
const pageRepo = new BusinessPageRepository()
const linkRepo = new PageLinkRepository()
const businessRepo = new BusinessRepository()

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      return await businessRepo.getAll()
    },
  })
}

export function useDashboardStats(businessId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', businessId],
    queryFn: async () => {
      if (!businessId) return null
      const [reviewsResponse, statsData] = await Promise.all([
        reviewRepo.getByBusinessId(businessId, 100),
        analyticsRepo.getStatsByBusinessId(businessId)
      ])
      return {
        reviews: reviewsResponse.data || [],
        stats: statsData || []
      }
    },
    enabled: !!businessId,
  })
}

export function useReviews(businessId: string | undefined, page: number, limit: number = 5) {
  return useQuery({
    queryKey: ['reviews', businessId, page, limit],
    queryFn: async () => {
      if (!businessId) return { data: [], total: 0 }
      const offset = (page - 1) * limit
      return await reviewRepo.getByBusinessId(businessId, limit, offset)
    },
    enabled: !!businessId,
  })
}

export function useBusinessPage(businessId: string | undefined) {
  return useQuery({
    queryKey: ['business-page', businessId],
    queryFn: async () => {
      if (!businessId) return null
      let pageData = await pageRepo.getByBusinessId(businessId)
      if (!pageData) {
        pageData = await pageRepo.create(businessId)
      }
      return pageData
    },
    enabled: !!businessId,
  })
}

export function usePageLinks(pageId: string | undefined) {
  return useQuery({
    queryKey: ['page-links', pageId],
    queryFn: async () => {
      if (!pageId) return []
      return await linkRepo.getByPageId(pageId)
    },
    enabled: !!pageId,
  })
}

export function useLinkMutations(pageId: string | undefined) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (newLink: CreatePageLinkDTO) => linkRepo.create(newLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-links', pageId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'page_links'> }) => linkRepo.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-links', pageId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linkRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-links', pageId] })
    },
  })

  const updateOrderMutation = useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) => linkRepo.updateOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-links', pageId] })
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    updateOrderMutation
  }
}
