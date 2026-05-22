import { Tables } from '@/types/supabase'

export type Business = Tables<'businesses'>
export type ReviewLink = Tables<'review_links'>
export type ReviewResponse = {
  id: string;
  review_id: string;
  business_id: string;
  author_id: string | null;
  author_role: 'customer' | 'admin' | 'super_admin';
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export type Review = Tables<'reviews'> & {
  author_role?: string;
  author_review_count?: number;
  response?: ReviewResponse | null;
  // Fields from the updated RPC
  response_id?: string | null;
  response_content?: string | null;
  response_author_role?: 'customer' | 'admin' | 'super_admin' | null;
  response_created_at?: string | null;
}
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
  display_name?: string
  user_id?: string
  auth_provider?: string
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
  fingerprint?: string
}
