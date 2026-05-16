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
      // Fetch totals
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
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getAllCustomers() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
