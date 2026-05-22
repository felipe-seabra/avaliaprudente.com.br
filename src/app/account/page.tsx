import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewList } from '@/components/account/review-list'
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

  // Fetch user's reviews
  const { data: reviews, error } = await supabase
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Minhas Avaliações</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-6 md:p-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReviewList initialReviews={(reviews as any) || []} />
      </div>
    </div>
  )
}
