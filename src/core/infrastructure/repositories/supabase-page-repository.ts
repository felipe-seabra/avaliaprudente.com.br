import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { BusinessPage, PageLink, CreatePageLinkDTO } from '@/core/domain/entities'

export class BusinessPageRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getByBusinessId(businessId: string): Promise<BusinessPage | null> {
    const { data, error } = await this.supabase
      .from('business_pages')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (error) return null
    return data
  }

  async getBySlug(slug: string): Promise<(BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string } }) | null> {
    // Resolve business by slug first
    const { data: business, error: bError } = await this.supabase
      .from('businesses')
      .select('id, name, logo_url, slug')
      .eq('slug', slug)
      .single()

    if (bError || !business) return null

    // Fetch the page for this business
    const { data: page, error: pError } = await this.supabase
      .from('business_pages')
      .select('*')
      .eq('business_id', business.id)
      .single()

    if (pError || !page) return null

    return { ...page, businesses: business }
  }

  async create(businessId: string): Promise<BusinessPage> {
    const { data, error } = await this.supabase
      .from('business_pages')
      .insert({ business_id: businessId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, page: Partial<BusinessPage>): Promise<BusinessPage> {
    const { data, error } = await this.supabase
      .from('business_pages')
      .update(page)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export class PageLinkRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getByPageId(pageId: string): Promise<PageLink[]> {
    const { data, error } = await this.supabase
      .from('page_links')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  async create(link: CreatePageLinkDTO): Promise<PageLink> {
    const { data, error } = await this.supabase
      .from('page_links')
      .insert(link)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, link: Partial<PageLink>): Promise<PageLink> {
    const { data, error } = await this.supabase
      .from('page_links')
      .update(link)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('page_links')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async updateOrder(links: { id: string, sort_order: number }[]): Promise<void> {
    try {
      // Use a batch of updates instead of upsert for better RLS compatibility
      const promises = links.map(link => 
        this.supabase
          .from('page_links')
          .update({ sort_order: link.sort_order })
          .eq('id', link.id)
      )

      const results = await Promise.all(promises)
      const error = results.find(r => r.error)?.error

      if (error) {
        console.error('❌ Error updating links order:', error)
        throw error
      }
    } catch (err) {
      console.error('❌ Unexpected error in updateOrder:', err)
      throw err
    }
  }
}
