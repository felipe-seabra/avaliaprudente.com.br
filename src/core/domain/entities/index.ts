import { Tables } from '@/types/supabase'

export type Business = Tables<'businesses'>
export type ReviewLink = Tables<'review_links'>
export type Review = Tables<'reviews'>
export type Profile = Tables<'profiles'>
export type BusinessPage = Tables<'business_pages'>
export type PageLink = Tables<'page_links'>
export type AnalyticsEvent = Tables<'analytics_events'>

export type UserRole = 'admin' | 'customer'

export type AccountStatus = 'active' | 'warned' | 'suspended' | 'banned'

export interface CreateBusinessDTO {
  name: string
  slug: string
  google_place_id?: string
  logo_url?: string
  address?: string
}

export interface CreateReviewLinkDTO {
  business_id: string
  slug: string
  redirect_url: string
}

export interface CreateReviewDTO {
  business_id: string
  rating: number
  feedback?: string
  customer_name?: string
  customer_email?: string
  source?: string
  is_internal: boolean
  submission_fingerprint?: string
  browser_fingerprint?: string
}

export interface CreatePageLinkDTO {
  page_id: string
  type: string
  title: string
  url: string
  icon_name?: string
  sort_order?: number
}

export interface CreateAnalyticsEventDTO {
  business_id?: string
  page_id?: string
  link_id?: string
  event_type: 'page_visit' | 'cta_click' | 'qr_scan'
  source?: string
  user_agent?: string
  metadata?: Record<string, unknown>
}
