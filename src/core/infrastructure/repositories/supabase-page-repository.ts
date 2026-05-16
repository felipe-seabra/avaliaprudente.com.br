import { createClient } from '@/lib/supabase/client'
import { BusinessPage, PageLink, CreatePageLinkDTO } from '@/core/domain/entities'

export class BusinessPageRepository {
  private supabase = createClient()

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
    const { data, error } = await this.supabase
      .from('business_pages')
      .select('*, businesses!inner(name, logo_url, slug)')
      .eq('businesses.slug', slug)
      .single()

    if (error) return null
    return data as unknown as (BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string } })
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
  private supabase = createClient()

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
    const { error } = await this.supabase
      .from('page_links')
      .upsert(links as unknown as PageLink[])

    if (error) throw error
  }
}
