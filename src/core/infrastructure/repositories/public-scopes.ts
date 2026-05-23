import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

/**
 * Centralized moderation scopes for public visibility.
 * This ensures that all public-facing queries follow the same moderation rules,
 * reducing the risk of "leakage" where frozen or moderated content appears publicly.
 */
export const PublicScopes = {
  /**
   * Returns a query builder for businesses that are publicly visible.
   * Rule: is_frozen = false
   */
  businesses(supabase: SupabaseClient<Database>) {
    return supabase
      .from('businesses')
      .select('*')
      .eq('is_frozen', false)
  },

  /**
   * Returns a query builder for business pages that are publicly visible.
   * Rule: Business must not be frozen AND Page must be published.
   */
  pages(supabase: SupabaseClient<Database>) {
    // Note: Since we often need business info too, we join with businesses
    return supabase
      .from('business_pages')
      .select('*, businesses!inner(*)')
      .eq('is_published', true)
      .eq('businesses.is_frozen', false)
  },

  /**
   * Returns a query builder for reviews that are publicly visible.
   * Rule: Business must not be frozen.
   */
  reviews(supabase: SupabaseClient<Database>) {
    return supabase
      .from('reviews')
      .select('*, businesses!inner(is_frozen)')
      .eq('businesses.is_frozen', false)
  },

  /**
   * Returns a query builder for review links that are publicly visible.
   * Rule: Business not frozen AND Link active.
   */
  reviewLinks(supabase: SupabaseClient<Database>) {
    return supabase
      .from('review_links')
      .select('*, businesses!inner(is_frozen)')
      .eq('is_active', true)
      .eq('businesses.is_frozen', false)
  },

  /**
   * Returns a query builder for links (on business pages) that are publicly visible.
   * Rule: Business not frozen AND Page published AND Link active.
   */
  links(supabase: SupabaseClient<Database>) {
    return supabase
      .from('page_links')
      .select('*, business_pages!inner(is_published, businesses!inner(is_frozen))')
      .eq('is_active', true)
      .eq('business_pages.is_published', true)
      .eq('business_pages.businesses.is_frozen', false)
  }
}

/**
 * Helper to apply public moderation filters to an existing PostgREST query.
 * Use this when you already have a query builder started.
 */
export function applyPublicModeration(
  query: { eq: (column: string, value: boolean) => unknown }
) {
  return query.eq('is_frozen', false)
}
