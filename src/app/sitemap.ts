import { MetadataRoute } from 'next'
import { APP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  
  // Fetch all businesses to include in sitemap using repository
  const businesses = await pageRepo.getSitemapEntries()

  const businessUrls: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: `${APP_CONFIG.url}/r/${business.slug}`,
    lastModified: new Date(business.updated_at),
  }))

  return [
    {
      url: APP_CONFIG.url,
    },
    {
      url: `${APP_CONFIG.url}/privacy`,
    },
    {
      url: `${APP_CONFIG.url}/terms`,
    },
    {
      url: `${APP_CONFIG.url}/r/demo`,
    },
    ...businessUrls
  ]
}
