'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action to handle targeted cache invalidation when a business 
 * moderation status changes (freeze, unfreeze, publish).
 * 
 * @param slug The business slug to invalidate
 */
export async function revalidateBusiness(slug: string) {
  if (!slug) return

  // 1. Authentication & Authorization Check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autorizado')
  }

  // Get user role for admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  // If not an admin, verify ownership of the business associated with the slug
  if (!isAdmin) {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      console.warn(`[Security] Unauthorized cache invalidation attempt for slug: ${slug} by user: ${user.id}`)
      throw new Error('Permissão negada para atualizar o cache desta empresa.')
    }
  }

  // 2. Invalidate targeted cache tags
  revalidateTag('public-rankings')
  revalidateTag(`business-page-${slug}`)

  // 3. Invalidate relevant paths to ensure fresh navigation
  revalidatePath('/')
  revalidatePath(`/r/${slug}`)
  revalidatePath('/sitemap.xml')

  console.log(`[Cache] Authorized invalidation for business: ${slug} (By: ${user.id})`)
}
