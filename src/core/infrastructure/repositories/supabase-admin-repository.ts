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

      const customersRes = await this.supabase.from('profiles').select('*', { count: 'exact', head: true })
      const businessesRes = await this.supabase.from('businesses').select('*', { count: 'exact', head: true })
      
      let verifiedCount = 0
      const verifiedRes = await this.supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('is_verified', true)
      if (!verifiedRes.error) {
         verifiedCount = verifiedRes.count || 0
      }

      const reviewsRes = await this.supabase.from('reviews').select('rating')
      const visitsRes = await this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_visit')
      const scansRes = await this.supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'nfc_scan')
      const newBusinessesRes = await this.supabase.from('businesses').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString())

      if (customersRes.error) console.error('AdminRepo: Error fetching customers count', customersRes.error)
      if (businessesRes.error) console.error('AdminRepo: Error fetching businesses count', businessesRes.error)
      if (reviewsRes.error) console.error('AdminRepo: Error fetching reviews', reviewsRes.error)

      const reviewList = (reviewsRes.data || []) as { rating: number }[]
      const averageRating = reviewList.length > 0 
        ? reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length 
        : 0

      return {
        totalCustomers: customersRes.count || 0,
        totalBusinesses: businessesRes.count || 0,
        verifiedBusinesses: verifiedCount,
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
    const { data, error } = await this.supabase
      .from('businesses')
      .select(`
        *,
        profiles!businesses_owner_id_fkey (
          full_name,
          email
        ),
        verifier:profiles!businesses_verified_by_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AdminRepo: getAllBusinesses error', error)
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
        .select('*, warning_count, account_status, suspended_until')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('AdminRepo: getAllCustomers error', error)
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from('profiles')
          .select('*, warning_count, account_status, suspended_until')
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

  async warnUser(userId: string, reason: string) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { error } = await this.supabase
      .from('moderation_actions')
      .insert({
        target_user_id: userId,
        admin_user_id: user?.id,
        action_type: 'warning',
        reason: reason
      })

    if (error) throw error
  }

  async suspendUser(userId: string, reason: string, days: number = 15) {
    const { data: { user } } = await this.supabase.auth.getUser()
    const suspendedUntil = new Date()
    suspendedUntil.setDate(suspendedUntil.getDate() + days)

    const { error } = await this.supabase
      .from('moderation_actions')
      .insert({
        target_user_id: userId,
        admin_user_id: user?.id,
        action_type: 'suspension',
        reason: reason,
        metadata: { suspended_until: suspendedUntil.toISOString() }
      })

    if (error) throw error
  }

  async reactivateUser(userId: string, reason: string = 'Conta reativada pelo administrador') {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { error } = await this.supabase
      .from('moderation_actions')
      .insert({
        target_user_id: userId,
        admin_user_id: user?.id,
        action_type: 'reactivation',
        reason: reason
      })

    if (error) throw error
  }

  async freezeBusiness(businessId: string, reason: string) {
    const { data: { user } } = await this.supabase.auth.getUser()

    // We first need the business owner_id to log it correctly in moderation_actions if we want audit per-user
    // But since moderation_actions targets profiles, we'll log it for the owner
    const { data: business } = await this.supabase.from('businesses').select('owner_id').eq('id', businessId).single()

    const { error } = await this.supabase
      .from('moderation_actions')
      .insert({
        target_user_id: business?.owner_id,
        admin_user_id: user?.id,
        action_type: 'freeze',
        reason: reason,
        metadata: { business_id: businessId }
      })

    if (error) throw error
  }

  async unfreezeBusiness(businessId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    const { data: business } = await this.supabase.from('businesses').select('owner_id').eq('id', businessId).single()

    const { error } = await this.supabase
      .from('moderation_actions')
      .insert({
        target_user_id: business?.owner_id,
        admin_user_id: user?.id,
        action_type: 'unfreeze',
        reason: 'Empresa liberada pelo administrador',
        metadata: { business_id: businessId }
      })

    if (error) throw error
  }

  async blockUser(userId: string, reason: string = 'Violou os termos de uso') {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_reason: reason
      })
      .eq('id', userId)

    if (error) throw error
  }

  async unblockUser(userId: string) {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        is_blocked: false,
        blocked_at: null,
        blocked_reason: null
      })
      .eq('id', userId)

    if (error) throw error
  }

  async setAdminRole(userId: string, isAdmin: boolean) {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        role: isAdmin ? 'admin' : 'customer'
      })
      .eq('id', userId)

    if (error) throw error
  }

  async verifyBusiness(businessId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    const { error } = await this.supabase
      .from('businesses')
      .update({
        verification_status: 'approved',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        is_verified: true
      })
      .eq('id', businessId)

    if (error) throw error
  }

  async rejectBusiness(businessId: string) {
    const { error } = await this.supabase
      .from('businesses')
      .update({
        verification_status: 'rejected',
        verified_by: null,
        verified_at: null,
        is_verified: false
      })
      .eq('id', businessId)

    if (error) throw error
  }

  async removeBusinessVerification(businessId: string) {
    const { error } = await this.supabase
      .from('businesses')
      .update({
        verification_status: 'pending',
        verified_by: null,
        verified_at: null,
        is_verified: false,
        verification_requested_at: null
      })
      .eq('id', businessId)

    if (error) throw error
  }

  async deleteBusiness(businessId: string) {
    const { error } = await this.supabase
      .from('businesses')
      .delete()
      .eq('id', businessId)

    if (error) throw error
  }
}
