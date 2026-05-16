import { createClient } from '@/lib/supabase/client'
import { CreateAnalyticsEventDTO } from '@/core/domain/entities'

export class AnalyticsRepository {
  private supabase = createClient()

  async track(event: CreateAnalyticsEventDTO): Promise<void> {
    const { error } = await this.supabase
      .from('analytics_events')
      .insert({
        ...event,
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
