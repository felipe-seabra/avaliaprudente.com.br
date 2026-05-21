import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Review, CreateReviewDTO } from '@/core/domain/entities'

export class ReviewRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getByBusinessId(businessId: string): Promise<Review[]> {
    // 💡 VIRTUAL DEMO REVIEWS
    // These reviews are displayed on the "/r/demo" page.
    // They are linked to the virtual business ID: 00000000-0000-0000-0000-000000000000
    if (businessId === '00000000-0000-0000-0000-000000000000') {
      return [
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
    }

    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
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
