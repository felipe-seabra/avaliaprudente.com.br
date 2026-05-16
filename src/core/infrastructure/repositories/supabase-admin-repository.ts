import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export interface AdminStats {
  totalCustomers: number
  totalBusinesses: number
  totalReviews: number
}

export class AdminRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getPlatformStats(): Promise<AdminStats> {
    try {
      // Fetch totals safely
      const [customers, businesses, reviews] = await Promise.all([
        this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
        this.supabase.from('businesses').select('*', { count: 'exact', head: true }),
        this.supabase.from('reviews').select('*', { count: 'exact', head: true })
      ])

      return {
        totalCustomers: customers.count || 0,
        totalBusinesses: businesses.count || 0,
        totalReviews: reviews.count || 0
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      return { totalCustomers: 0, totalBusinesses: 0, totalReviews: 0 }
    }
  }

  async getAllBusinesses() {
    // We select email from profiles (added via migration)
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AdminRepo: getAllBusinesses error', error)
      // Fallback if email field is not yet hydrated in profiles
      const { data: fallbackData, error: fallbackError } = await this.supabase
        .from('businesses')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        
      if (fallbackError) throw fallbackError
      return fallbackData
    }
    return data
  }

  async getAllCustomers() {
    // Try to order by created_at (added via migration)
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback to updated_at if created_at doesn't exist yet
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          
        if (fallbackError) throw fallbackError
        return fallbackData
      }
      return data
    } catch (err) {
      console.error('AdminRepo: getAllCustomers error', err)
      throw err
    }
  }
}
