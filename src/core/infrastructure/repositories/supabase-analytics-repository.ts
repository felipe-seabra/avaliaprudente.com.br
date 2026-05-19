import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { CreateAnalyticsEventDTO } from '@/core/domain/entities'
import { Json } from '@/types/supabase'
import { hasConsent } from '@/components/shared/cookie-consent'
import { getBrowserFingerprint } from '@/lib/utils'

export class AnalyticsRepository {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createBrowserClient()
  }

  async track(event: CreateAnalyticsEventDTO): Promise<void> {
    // LGPD Gating: Only track if analytics consent is granted (client-side only)
    if (typeof window !== 'undefined' && !hasConsent('analytics')) {
      return
    }

    const fingerprint = event.fingerprint || (await getBrowserFingerprint())

    const { error } = await this.supabase
      .from('analytics_events')
      .insert({
        business_id: event.business_id,
        page_id: event.page_id,
        link_id: event.link_id,
        event_type: event.event_type,
        source: event.source,
        metadata: (event.metadata || {}) as Json,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        fingerprint,
      })

    if (error) {
      console.error('Failed to track event:', error)
    }
  }

  async getStatsByBusinessId(businessId: string) {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('business_id', businessId)

    if (error) throw error
    return data
  }
}
