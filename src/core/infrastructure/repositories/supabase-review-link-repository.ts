import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { ReviewLink, CreateReviewLinkDTO, Business } from '@/core/domain/entities'
import { PublicScopes } from './public-scopes'
import { Database } from '@/types/supabase'

export class ReviewLinkRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

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
    const { data, error } = await PublicScopes.reviewLinks(this.supabase as SupabaseClient<Database>)
      .select('*, businesses!inner(*)')
      .ilike('slug', slug)
      .maybeSingle()

    if (error || !data) return null
    
    return data as unknown as (ReviewLink & { businesses: Business })
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('is_slug_available', { 
        slug_to_check: slug
      })

    if (error) {
      console.error('Error checking slug availability:', error)
      const { data: existing } = await this.supabase
        .from('review_links')
        .select('id')
        .ilike('slug', slug)
        .maybeSingle()
      return !existing
    }

    return !!data
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
