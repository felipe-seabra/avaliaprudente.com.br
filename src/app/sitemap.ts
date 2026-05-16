import { MetadataRoute } from 'next'
import { APP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { BusinessRepository } from '@/core/infrastructure/repositories/supabase-business-repository'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const businessRepo = new BusinessRepository(supabase)
  
  // Fetch all businesses to include in sitemap
  let businesses: { slug: string, updated_at: string }[] = []
  try {
    const data = await businessRepo.getAll()
    businesses = data.map(b => ({ slug: b.slug, updated_at: b.updated_at }))
  } catch (err) {
    console.error('Failed to fetch businesses for sitemap:', err)
  }

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
    ...businessUrls
  ]
}
