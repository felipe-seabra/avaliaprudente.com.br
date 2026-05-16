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

      const [
        { count: customers },
        { count: businesses },
        { count: verifiedBusinesses },
        { data: reviews },
        { count: visits },
        { count: nfcScans },
        { count: newBusinesses }
      ] = await Promise.all([
        this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
        this.supabase.from('businesses').select('*', { count: 'exact', head: true }),
        this.supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        this.supabase.from('reviews').select('rating'),
        this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_visit'),
        this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'nfc_scan'),
        this.supabase.from('businesses').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString())
      ])

      const reviewList = reviews || []
      const averageRating = reviewList.length > 0 
        ? reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length 
        : 0

      return {
        totalCustomers: customers || 0,
        totalBusinesses: businesses || 0,
        verifiedBusinesses: verifiedBusinesses || 0,
        totalReviews: reviewList.length,
        averageRating: Number(averageRating.toFixed(1)),
        totalVisits: visits || 0,
        totalNfcScans: nfcScans || 0,
        newBusinessesThisMonth: newBusinesses || 0
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
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AdminRepo: getAllBusinesses error', error)
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
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
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
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('*, businesses(name, slug)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  }
}
