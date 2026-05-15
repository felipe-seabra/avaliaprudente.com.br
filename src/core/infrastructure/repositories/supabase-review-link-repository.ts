import { createClient } from '@/lib/supabase/client'
import { ReviewLink, CreateReviewLinkDTO, Business } from '@/core/domain/entities'

export class ReviewLinkRepository {
  private supabase = createClient()

  async getByBusinessId(businessId: string): Promise<ReviewLink[]> {
    const { data, error } = await this.supabase
      .from('review_links')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getBySlug(slug: string): Promise<(ReviewLink & { businesses: Business }) | null> {
    const { data, error } = await this.supabase
      .from('review_links')
      .select('*, businesses(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data as unknown as (ReviewLink & { businesses: Business })
  }

  async create(link: CreateReviewLinkDTO): Promise<ReviewLink> {
    const { data, error } = await this.supabase
      .from('review_links')
      .insert(link)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, link: Partial<CreateReviewLinkDTO>): Promise<ReviewLink> {
    const { data, error } = await this.supabase
      .from('review_links')
      .update(link)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_links')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
