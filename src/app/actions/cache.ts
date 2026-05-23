'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Server Action to handle targeted cache invalidation when a business 
 * moderation status changes (freeze, unfreeze, publish).
 * 
 * @param slug The business slug to invalidate
 */
export async function revalidateBusiness(slug: string) {
  if (!slug) return

  // 1. Invalidate targeted cache tags
  revalidateTag('public-rankings')
  revalidateTag(`business-page-${slug}`)

  // 2. Invalidate relevant paths to ensure fresh navigation
  // revalidatePath is used for the router cache and layout/page segments
  revalidatePath('/')
  revalidatePath(`/r/${slug}`)
  revalidatePath('/sitemap.xml')

  console.log(`[Cache] Invalidated tags and paths for business: ${slug}`)
}
