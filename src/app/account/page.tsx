import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewList } from '@/components/account/review-list'
import { ReputationBadge } from '@/components/shared/reputation-badge'
import { UserCircle } from 'lucide-react'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'

export const metadata = {
  title: 'Minha Conta - Avalia Prudente',
  description: 'Gerencie suas avaliações.',
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AccountPage({ searchParams }: Props) {
  const sParams = await searchParams
  const pageParam = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  const limit = 5
  const offset = (pageParam - 1) * limit

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const reviewRepo = new ReviewRepository(supabase)

  // Fetch user's reviews and reputation
  const [reviewsResponse, statsResponse, profileResponse] = await Promise.all([
    reviewRepo.getByUserId(user.id, limit, offset),
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

  const { data: reviews, total: totalReviews } = reviewsResponse
  const reputationCount = statsResponse.data?.approved_reviews_count || 0
  const userRole = profileResponse.data?.role

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
        <ReviewList 
          initialReviews={reviews || []} 
          totalReviews={totalReviews}
          currentPage={pageParam}
        />
      </div>
    </div>
  )
}
