import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Business, CreateBusinessDTO } from '@/core/domain/entities'

export class BusinessRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getAll(): Promise<Business[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) return []

    // Explicitly filter by owner_id for dashboard listing
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Business | null> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async getBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) return null
    return data
  }

  async create(business: CreateBusinessDTO): Promise<Business> {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    // Create business
    const { data, error } = await this.supabase
      .from('businesses')
      .insert({
        ...business,
        owner_id: userData.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return data
  }

  async update(id: string, business: Partial<CreateBusinessDTO>): Promise<Business> {
    const { data, error } = await this.supabase
      .from('businesses')
      .update(business)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
