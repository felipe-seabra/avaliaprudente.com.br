import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { CreateAnalyticsEventDTO } from '@/core/domain/entities'
import { hasConsent } from '@/components/shared/cookie-consent'

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

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: event.business_id,
          page_id: event.page_id,
          link_id: event.link_id,
          event_type: event.event_type,
          source: event.source,
          metadata: event.metadata,
        }),
      })
    } catch (err) {
      console.error('Failed to track event via API:', err)
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
