import { MetadataRoute } from 'next'
import { APP_CONFIG } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/r/',
          '/login',
          '/register',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/blocked',
        ],
      },
    ],
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  }
}
