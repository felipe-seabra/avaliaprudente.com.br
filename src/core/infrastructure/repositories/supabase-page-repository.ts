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
      .maybeSingle()

    if (error) return null
    return data
  }

  async getBySlug(slug: string): Promise<(BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string, id: string, is_verified?: boolean } }) | null> {
    // 1. Check for Virtual Demo Profile
    if (slug === 'demo' || slug === 'demonstracao') {
      const demoBusiness = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Avalia Prudente Demo',
        logo_url: '/branding/logo-vertical.webp',
        slug: 'demo',
        is_verified: true
      }
      
      return {
        id: 'demo-page',
        business_id: demoBusiness.id,
        description: 'Esta é uma página de demonstração. Veja como sua empresa pode brilhar com o Avalia Prudente e nossas tags NFC inteligentes.',
        theme_config: { primary_color: '#7c3aed', layout: 'standard' },
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        businesses: demoBusiness
      } as unknown as (BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string, id: string, is_verified?: boolean } })
    }

    // 2. Resolve business by slug first (Publicly accessible)
    const { data: business, error: bError } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (bError || !business) {
       if (bError) console.error('BusinessPageRepo: Error fetching business', bError)
       return null
    }

    // 3. Fetch the page for this business
    const { data: page } = await this.supabase
      .from('business_pages')
      .select('*')
      .eq('business_id', business.id)
      .maybeSingle()

    // 4. Handle newly created businesses without a page entry yet
    if (!page) {
      return {
        id: 'initial-page',
        business_id: business.id,
        description: `Bem-vindo à página oficial de ${business.name}. Em breve, mais informações e links úteis.`,
        theme_config: { primary_color: '#7c3aed', layout: 'standard' },
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        businesses: business
      } as unknown as (BusinessPage & { businesses: { name: string, logo_url: string | null, slug: string, id: string, is_verified?: boolean } })
    }

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
    if (pageId === 'initial-page') {
      return []
    }

    // Virtual Demo Links
    if (pageId === 'demo-page') {
      return [
        {
          id: 'demo-link-1',
          page_id: 'demo-page',
          type: 'google_review',
          title: 'Avalie-nos no Google',
          url: 'https://maps.google.com',
          icon_name: null,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        },
        {
          id: 'demo-link-2',
          page_id: 'demo-page',
          type: 'whatsapp',
          title: 'Fale conosco no WhatsApp',
          url: 'https://wa.me/5518998230188',
          icon_name: null,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        },
        {
          id: 'demo-link-3',
          page_id: 'demo-page',
          type: 'instagram',
          title: 'Siga-nos no Instagram',
          url: 'https://instagram.com/avaliaprudenteoficial',
          icon_name: null,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }
      ]
    }

    const { data, error } = await this.supabase
      .from('page_links')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('PageLinkRepo: Error fetching links', error)
      return []
    }
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
