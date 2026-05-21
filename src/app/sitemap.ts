import { MetadataRoute } from 'next'
import { APP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  
  // Fetch all businesses to include in sitemap using repository
  const businesses = await pageRepo.getSitemapEntries()

  const businessUrls: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: `${APP_CONFIG.url}/r/${business.slug}`,
    lastModified: new Date(business.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: APP_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${APP_CONFIG.url}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_CONFIG.url}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_CONFIG.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${APP_CONFIG.url}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Showcase demo pages
    {
      url: `${APP_CONFIG.url}/r/demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${APP_CONFIG.url}/r/demonstracao`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...businessUrls
  ]
}
