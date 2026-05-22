import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewList } from '@/components/account/review-list'
import { ReputationBadge } from '@/components/shared/reputation-badge'
import { UserCircle } from 'lucide-react'

export const metadata = {
  title: 'Minha Conta - Avalia Prudente',
  description: 'Gerencie suas avaliações.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's reviews and reputation
  const [reviewsResponse, statsResponse, profileResponse] = await Promise.all([
    supabase
      .from('reviews')
      .select(`
        id,
        rating,
        feedback,
        created_at,
        updated_at,
        business_id,
        businesses (
          name,
          slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviewer_stats')
      .select('approved_reviews_count')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
  ])

  const reviews = reviewsResponse.data
  const error = reviewsResponse.error
  const reputationCount = statsResponse.data?.approved_reviews_count || 0
  const userRole = profileResponse.data?.role

  if (error) {
    console.error('Error fetching reviews:', error)
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Minhas Avaliações</h1>
        </div>
        <ReputationBadge 
          count={Number(reputationCount)} 
          role={userRole} 
          className="h-7 px-3 text-xs"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-6 md:p-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReviewList initialReviews={(reviews as any) || []} />
      </div>
    </div>
  )
}
