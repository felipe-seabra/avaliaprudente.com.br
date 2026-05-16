import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Business, CreateBusinessDTO } from '@/core/domain/entities'
import { extractStoragePath } from '@/lib/supabase/storage-utils'

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
    // Cleanup old logo if logo_url is being updated
    if (business.logo_url !== undefined) {
      const oldBusiness = await this.getById(id)
      if (oldBusiness?.logo_url && oldBusiness.logo_url !== business.logo_url) {
        const oldPath = extractStoragePath(oldBusiness.logo_url)
        if (oldPath) {
          await this.supabase.storage.from('business-assets').remove([oldPath])
          console.log('✅ Cleaned up old logo storage asset:', oldPath)
        }
      }
    }

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
    // 1. Fetch business to get logo_url for cleanup
    const business = await this.getById(id)
    
    // 2. Perform cleanup if logo exists
    if (business?.logo_url) {
      const path = extractStoragePath(business.logo_url)
      if (path) {
        try {
          await this.supabase.storage.from('business-assets').remove([path])
          console.log('✅ Storage asset cleaned up during deletion:', path)
        } catch (storageErr) {
          console.error('Failed to cleanup storage asset:', storageErr)
        }
      }
    }

    // 3. Delete database record
    const { error } = await this.supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
