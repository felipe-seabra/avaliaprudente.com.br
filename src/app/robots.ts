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
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/account/',
          '/onboarding/',
          '/api/',
          '/auth/',
          '/blocked',
        ],
      },
    ],
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  }
}
