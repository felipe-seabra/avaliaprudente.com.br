import { createClient } from '@/lib/supabase/client'
import { CreateAnalyticsEventDTO } from '@/core/domain/entities'
import { Json } from '@/types/supabase'
import { hasConsent } from '@/components/shared/cookie-consent'

export class AnalyticsRepository {
  private supabase = createClient()

  async track(event: CreateAnalyticsEventDTO): Promise<void> {
    // LGPD Gating: Only track if analytics consent is granted
    if (!hasConsent('analytics')) {
      return
    }

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
