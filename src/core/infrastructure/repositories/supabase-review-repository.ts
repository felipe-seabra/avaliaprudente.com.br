import { createClient } from '@/lib/supabase/client'
import { Review, CreateReviewDTO } from '@/core/domain/entities'

export class ReviewRepository {
  private supabase = createClient()

  async getByBusinessId(businessId: string): Promise<Review[]> {
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
