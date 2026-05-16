import { Tables } from '@/types/supabase'

export type Business = Tables<'businesses'>
export type ReviewLink = Tables<'review_links'>
export type Review = Tables<'reviews'>
export type Profile = Tables<'profiles'>
export type BusinessPage = Tables<'business_pages'>
export type PageLink = Tables<'page_links'>

export type UserRole = 'admin' | 'customer'

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
}

export interface CreatePageLinkDTO {
  page_id: string
  type: string
  title: string
  url: string
  icon_name?: string
  sort_order?: number
}
