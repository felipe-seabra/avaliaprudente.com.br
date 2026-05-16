import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export interface AdminStats {
  totalCustomers: number
  totalBusinesses: number
  verifiedBusinesses: number
  totalReviews: number
  averageRating: number
  totalVisits: number
  totalNfcScans: number
  newBusinessesThisMonth: number
}

export class AdminRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getPlatformStats(): Promise<AdminStats> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Fetch metrics individually to avoid Promise.all failure on single query error
      // Also allows better debugging
      const customersRes = await this.supabase.from('profiles').select('*', { count: 'exact', head: true })
      const businessesRes = await this.supabase.from('businesses').select('*', { count: 'exact', head: true })
      const verifiedRes = await this.supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', true)
      const reviewsRes = await this.supabase.from('reviews').select('rating')
      const visitsRes = await this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_visit')
      const scansRes = await this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'nfc_scan')
      const newBusinessesRes = await this.supabase.from('businesses').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString())

      // Log errors if any but don't crash
      if (customersRes.error) console.error('AdminRepo: Error fetching customers count', customersRes.error)
      if (businessesRes.error) console.error('AdminRepo: Error fetching businesses count', businessesRes.error)
      if (reviewsRes.error) console.error('AdminRepo: Error fetching reviews', reviewsRes.error)

      const reviewList = reviewsRes.data || []
      const averageRating = reviewList.length > 0 
        ? reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length 
        : 0

      return {
        totalCustomers: customersRes.count || 0,
        totalBusinesses: businessesRes.count || 0,
        verifiedBusinesses: verifiedRes.count || 0,
        totalReviews: reviewList.length,
        averageRating: Number(averageRating.toFixed(1)),
        totalVisits: visitsRes.count || 0,
        totalNfcScans: scansRes.count || 0,
        newBusinessesThisMonth: newBusinessesRes.count || 0
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
      return { 
        totalCustomers: 0, totalBusinesses: 0, verifiedBusinesses: 0, 
        totalReviews: 0, averageRating: 0, totalVisits: 0, totalNfcScans: 0, newBusinessesThisMonth: 0 
      }
    }
  }

  async getAllBusinesses() {
    // With the new foreign key, this join should work perfectly
    const { data, error } = await this.supabase
      .from('businesses')
      .select(`
        *,
        profiles!businesses_owner_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AdminRepo: getAllBusinesses error', error)
      // Fallback without profiles join if it still fails
      const { data: fallbackData, error: fallbackError } = await this.supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (fallbackError) throw fallbackError
      return fallbackData
    }
    return data
  }

  async getAllCustomers() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('AdminRepo: getAllCustomers error', error)
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

  async getRecentActivity() {
    try {
      const { data, error } = await this.supabase
        .from('analytics_events')
        .select('*, businesses(name, slug)')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('AdminRepo: getRecentActivity error', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('AdminRepo: getRecentActivity unexpected error', err)
      return []
    }
  }
}
