import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { PublicScopes } from '@/core/infrastructure/repositories/public-scopes'
import { unstable_cache } from 'next/cache'

interface RankedBusiness {
  id: string
  name: string
  slug: string
  logo_url: string | null
  avg_rating: number
  review_count: number
  visit_count: number
  is_verified?: boolean
  is_featured?: boolean
  rank_score: number
  trending_score: number
}

interface SupabaseBusinessRow {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_verified: boolean | null
  is_featured: boolean | null
  is_frozen: boolean
  reviews: { rating: number; created_at: string }[] | { rating: number; created_at: string } | null
  analytics_events: { event_type: string; created_at: string }[] | { event_type: string; created_at: string } | null
}

/**
 * Internal function to fetch and calculate rankings.
 * Bypasses RLS using Service Role for analytics processing.
 */
async function fetchAndCalculateRankings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Use Service Role to bypass RLS for ranking calculation
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch businesses using centralized public scope
  const { data: businesses, error } = await PublicScopes.businesses(supabase)
    .select(`
      id, 
      name, 
      slug, 
      logo_url,
      is_verified,
      is_featured,
      is_frozen,
      reviews (rating, created_at),
      analytics_events (event_type, created_at)
    `)
    .limit(100)

  if (error) {
    console.error('Error fetching rankings:', error)
    return { topRated: [], mostViewed: [] }
  }

  const typedBusinesses = (businesses as unknown as SupabaseBusinessRow[]) || []

  // Algorithm Constants
  const MIN_REVIEWS_THRESHOLD = 2
  const GLOBAL_MEAN_RATING = 4.0
  const FEATURED_BOOST = 0.5

  // Process data
  const processed = typedBusinesses.map(b => {
    const reviews = Array.isArray(b.reviews) ? b.reviews : b.reviews ? [b.reviews] : []
    const analytics = Array.isArray(b.analytics_events) ? b.analytics_events : b.analytics_events ? [b.analytics_events] : []
    
    const reviewCount = reviews.length
    const avgRating = reviewCount > 0 
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewCount 
      : 0

    // 1. Elite Score (Bayesian Average)
    let eliteScore = reviewCount >= MIN_REVIEWS_THRESHOLD
      ? (reviewCount * avgRating + MIN_REVIEWS_THRESHOLD * GLOBAL_MEAN_RATING) / (reviewCount + MIN_REVIEWS_THRESHOLD)
      : (reviewCount * avgRating) / 2

    if (b.is_featured) eliteScore += FEATURED_BOOST

    // 2. Trending Score (Recent Engagement)
    const recentAnalytics = analytics.filter(e => {
       const eventDate = new Date(e.created_at)
       return eventDate >= thirtyDaysAgo && e.event_type === 'page_visit'
    })
    
    const trendingScore = recentAnalytics.length + (b.is_featured ? 10 : 0)

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url,
      avg_rating: avgRating || 5.0,
      review_count: reviewCount,
      visit_count: recentAnalytics.length,
      rank_score: eliteScore,
      trending_score: trendingScore,
      is_verified: b.is_verified || false,
      is_featured: b.is_featured || false
    } as RankedBusiness
  })

  const limit = 5
  
  // Sorting
  const topRated = [...processed]
    .filter(b => b.review_count > 0)
    .sort((a, b) => {
      if (b.rank_score !== a.rank_score) return b.rank_score - a.rank_score
      return b.review_count - a.review_count
    })
    .slice(0, limit)

  const mostViewed = [...processed]
    .filter(b => b.visit_count > 0 || b.is_featured)
    .sort((a, b) => {
      if (b.trending_score !== a.trending_score) return b.trending_score - a.trending_score
      return b.rank_score - a.rank_score
    })
    .slice(0, limit)

  return { topRated, mostViewed }
}

/**
 * Fetches and calculates rankings on the server side to bypass RLS
 * for analytics_events and other protected data used in public aggregates.
 * 
 * Cached for 1 hour but supports programmatic invalidation via 'public-rankings' tag.
 */
export const getPublicRankings = unstable_cache(
  async () => fetchAndCalculateRankings(),
  ['public-rankings'],
  { 
    revalidate: 3600,
    tags: ['public-rankings']
  }
)
