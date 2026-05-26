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
      .eq('slug', slug.toLowerCase())
      .single()

    if (error) return null
    return data
  }

  async isSlugAvailable(slug: string, excludeBusinessId?: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('is_slug_available', { 
        slug_to_check: slug.toLowerCase(),
        exclude_business_id: excludeBusinessId
      })

    if (error) {
      console.error('Error checking slug availability:', error)
      // Fallback to manual check if RPC fails (e.g. migration not applied yet)
      const existing = await this.getBySlug(slug)
      if (excludeBusinessId) {
        return !existing || existing.id === excludeBusinessId
      }
      return !existing
    }

    return !!data
  }

  async getAvailableSlug(baseSlug: string, excludeBusinessId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1
    let available = await this.isSlugAvailable(slug, excludeBusinessId)

    while (!available && counter < 100) {
      // Try suffixes like -2, -3, or -oficial, -sp if we want more fancy suggestions
      // For now, let's keep it simple with numeric suffixes
      slug = `${baseSlug}-${counter}`
      available = await this.isSlugAvailable(slug, excludeBusinessId)
      counter++
    }

    return slug
  }

  async create(business: CreateBusinessDTO): Promise<Business> {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

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

  async update(id: string, business: Partial<Business>): Promise<Business> {
    if (business.logo_url !== undefined) {
      const oldBusiness = await this.getById(id)
      if (oldBusiness?.logo_url && oldBusiness.logo_url !== business.logo_url) {
        const oldPath = extractStoragePath(oldBusiness.logo_url)
        if (oldPath) {
          await this.supabase.storage.from('business-assets').remove([oldPath])
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

    // Note: We use fetch to a server action or API route for audit logging if client-side,
    // or just let the database handle audit logs if it's done via database triggers.
    // In our case, since this repository is used client-side and server-side,
    // we should make sure we're logging only when we can, or rely on a wrapper.
    // Given the task is about security boundaries, the audit log should ideally be server-side.
    // We'll leave the repo as-is and rely on the UI/API to log or create a trigger.
    return data
  }

  async delete(id: string): Promise<void> {
    const business = await this.getById(id)
    
    if (business?.logo_url) {
      const path = extractStoragePath(business.logo_url)
      if (path) {
        try {
          await this.supabase.storage.from('business-assets').remove([path])
        } catch (storageErr) {
          console.error('Failed to cleanup storage asset:', storageErr)
        }
      }
    }

    const { error } = await this.supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
