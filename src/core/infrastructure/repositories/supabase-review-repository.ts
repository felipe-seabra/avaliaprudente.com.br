import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Review, CreateReviewDTO } from '@/core/domain/entities'

export class ReviewRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getByBusinessId(businessId: string, limit: number = 5, offset: number = 0): Promise<{ reviews: Review[], total: number }> {
    // 💡 VIRTUAL DEMO REVIEWS
    if (businessId === '00000000-0000-0000-0000-000000000000') {
      const demoReviews = [
        {
          id: 'demo-review-1',
          business_id: businessId,
          rating: 5,
          customer_name: 'Felipe Amorim',
          feedback: 'Excelente atendimento e tecnologia inovadora! O NFC facilita muito.',
          created_at: new Date().toISOString(),
          is_internal: true,
          source: 'nfc',
          customer_email: null,
          display_name: 'Felipe Amorim',
          user_id: null,
          auth_provider: null,
          browser_fingerprint: null,
          submission_fingerprint: null
        },
        {
          id: 'demo-review-2',
          business_id: businessId,
          rating: 5,
          customer_name: 'Maria Silva',
          feedback: 'Muito prático para deixar minha opinião.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_internal: true,
          source: 'qr_code',
          customer_email: null,
          display_name: 'Maria Silva',
          user_id: null,
          auth_provider: null,
          browser_fingerprint: null,
          submission_fingerprint: null
        },
        {
          id: 'demo-review-3',
          business_id: businessId,
          rating: 4,
          customer_name: 'João Pedro',
          feedback: null,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          is_internal: true,
          source: 'nfc',
          customer_email: null,
          display_name: 'João Pedro',
          user_id: null,
          auth_provider: null,
          browser_fingerprint: null,
          submission_fingerprint: null
        }
      ] as Review[]
      return { reviews: demoReviews.slice(offset, offset + limit), total: demoReviews.length }
    }

    const { data, error } = await this.supabase
      .rpc('get_business_reviews_with_stats', { 
        b_id: businessId,
        p_limit: limit,
        p_offset: offset
      })

    if (error) {
      console.error('Error fetching reviews with stats:', error)
      // Fallback to standard reviews fetch if RPC fails
      const { data: fallbackData, count, error: fallbackError } = await this.supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (fallbackError) throw fallbackError
      return { reviews: (fallbackData || []) as Review[], total: count || 0 }
    }
    
    const reviews = (data || []) as (Review & { total_count?: number })[]
    const total = reviews.length > 0 ? Number(reviews[0].total_count) : 0

    return { reviews, total }
  }

  async getByUserId(userId: string, limit: number = 5, offset: number = 0): Promise<{ reviews: Review[], total: number }> {
    const { data, count, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        businesses (
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { reviews: (data || []) as Review[], total: count || 0 }
  }

  async create(review: CreateReviewDTO): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
