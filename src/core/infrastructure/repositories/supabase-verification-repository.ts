import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export interface VerificationRequest {
  id: string
  business_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  admin_response: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  businesses?: {
    name: string
    slug: string
  }
  profiles?: {
    full_name: string
    email: string
  }
}

export class VerificationRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async getByBusinessId(businessId: string): Promise<VerificationRequest[]> {
    const { data, error } = await this.supabase
      .from('verification_requests')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(businessId: string, message?: string): Promise<VerificationRequest> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: existing, error: fetchError } = await this.supabase
      .from('verification_requests')
      .select('id')
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .maybeSingle()

    if (fetchError) throw fetchError
    if (existing) throw new Error('Já existe um pedido de verificação pendente para esta empresa.')

    const { data, error } = await this.supabase
      .from('verification_requests')
      .insert({
        business_id: businessId,
        user_id: user.id,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getAllForAdmin(): Promise<VerificationRequest[]> {
    const { data, error } = await this.supabase
      .from('verification_requests')
      .select(`
        *,
        businesses!verification_requests_business_id_fkey (name, slug),
        profiles!verification_requests_user_id_fkey (full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('VerificationRepo: getAllForAdmin error', error)
      throw error
    }
    return data || []
  }

  async approve(requestId: string, adminResponse?: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: request, error: fetchError } = await this.supabase
      .from('verification_requests')
      .select('business_id')
      .eq('id', requestId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateRequestError } = await this.supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        admin_response: adminResponse || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', requestId)

    if (updateRequestError) throw updateRequestError

    const { error: updateBusinessError } = await this.supabase
      .from('businesses')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        verification_status: 'verified'
      })
      .eq('id', request.business_id)

    if (updateBusinessError) throw updateBusinessError
  }

  async reject(requestId: string, adminResponse: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: request, error: fetchError } = await this.supabase
      .from('verification_requests')
      .select('business_id')
      .eq('id', requestId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateRequestError } = await this.supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        admin_response: adminResponse,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', requestId)

    if (updateRequestError) throw updateRequestError

    await this.supabase
      .from('businesses')
      .update({ 
        verification_status: 'rejected',
        is_verified: false
      })
      .eq('id', request.business_id)
  }
}
