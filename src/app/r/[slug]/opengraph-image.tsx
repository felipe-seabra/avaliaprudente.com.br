import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { Business, BusinessPage } from '@/core/domain/entities'
import { isValidSafeRemoteUrl } from '@/lib/utils'

// Route segment config
export const runtime = 'edge'

interface ThemeConfig {
  primary_color?: string
}

type PageWithBusiness = BusinessPage & { businesses: Business }

// Image metadata
export const alt = 'Avalia Prudente - Perfil da Empresa'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * Normalizes hex color for Satori
 */
function normalizeColor(color?: string): string {
  if (!color) return '#7c3aed'
  const hex = color.startsWith('#') ? color : `#${color}`
  if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return hex
  return '#7c3aed'
}

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    // Fetch data
    const supabase = await createClient()
    const pageRepo = new BusinessPageRepository(supabase)
    const reviewRepo = new ReviewRepository(supabase)
    const reviewLinkRepo = new ReviewLinkRepository(supabase)
    
    // Resolve business data
    let data = await pageRepo.getBySlug(slug) as PageWithBusiness | null
    
    if (!data) {
      const reviewLink = await reviewLinkRepo.getBySlug(slug)
      if (reviewLink) {
        data = await pageRepo.getByBusinessId(reviewLink.business_id) as PageWithBusiness | null
        if (!data) {
          data = {
            id: 'fallback',
            business_id: reviewLink.business_id,
            businesses: reviewLink.businesses,
            theme_config: { primary_color: '#7c3aed' },
            description: '',
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as PageWithBusiness
        } else {
          data.businesses = reviewLink.businesses
        }
      }
    }

    if (!data) {
      throw new Error('Business not found')
    }

    const businessName = data.businesses.name || 'Empresa'
    const isVerified = data.businesses.is_verified
    const themeConfig = (data.theme_config || {}) as ThemeConfig
    const primaryColor = normalizeColor(themeConfig.primary_color)
    
    // Stats fetch
    let reviews: { rating: number }[] = []
    try {
        const fetchedReviews = await reviewRepo.getByBusinessId(data.business_id)
        reviews = fetchedReviews || []
    } catch (e) {
        console.error('Failed to fetch reviews for OG:', e)
    }

    const reviewCount = reviews.length
    const avgRating = reviewCount > 0 
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1)
      : '5.0'

    // Fetch logo as ArrayBuffer for Satori stability
    let logoBuffer: ArrayBuffer | null = null
    const logoUrl = data.businesses.logo_url

    if (logoUrl && isValidSafeRemoteUrl(logoUrl)) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // Reduced timeout for safety
        
        // Strategy: If WebP, try to fetch the -og.png derivative first
        let urlToFetch = logoUrl
        const isWebP = logoUrl.toLowerCase().endsWith('.webp')
        
        if (isWebP) {
          const ogUrl = logoUrl.replace(/\.webp$/i, '-og.png')
          try {
            // We use a separate fetch with a shorter timeout to check for existence
            const ogResponse = await fetch(ogUrl, { 
              method: 'HEAD',
              signal: controller.signal 
            })
            if (ogResponse.ok) {
              urlToFetch = ogUrl
            }
          } catch (e) {
            // Ignore OG fetch failure, fall back to original (which might still be rejected if WebP)
          }
        }

        const response = await fetch(urlToFetch, {
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          const isSupported = contentType && (
            contentType.includes('png') || 
            contentType.includes('jpeg') || 
            contentType.includes('jpg') ||
            contentType.includes('svg+xml')
          )

          if (isSupported) {
            logoBuffer = await response.arrayBuffer()
          } else {
            console.warn(`[OG Image] Unsupported logo format: ${contentType} for ${slug}. Falling back to text avatar.`)
          }
        }
      } catch (e) {
        console.error('Failed to fetch business logo for OG:', e)
      }
    } else if (logoUrl) {
      console.warn(`[OG Image] Blocked potentially unsafe logo URL: ${logoUrl} for ${slug}`)
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'white',
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Decorative Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '400px',
              display: 'flex',
              backgroundImage: `linear-gradient(to bottom, rgba(124, 58, 237, 0.05), rgba(255, 255, 255, 0))`,
            }}
          />

          {/* Logo Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 180,
              height: 180,
              borderRadius: 45,
              background: 'white',
              border: `6px solid ${primaryColor}20`,
              marginBottom: 32,
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {logoBuffer ? (
              <img
                src={logoBuffer as unknown as string}
                alt={businessName}
                width="180"
                height="180"
                style={{
                  objectFit: 'cover',
                  borderRadius: 39, // Slightly less than container to look good with border
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 90,
                  fontWeight: 900,
                  color: primaryColor,
                  display: 'flex',
                }}
              >
                {businessName.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Business Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 1000,
            }}
          >
            <div
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: '#09090b',
                margin: 0,
                letterSpacing: '-4px',
                lineHeight: 1.1,
                display: 'flex',
              }}
            >
              {businessName}
            </div>

            {/* Stats Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 40,
                background: '#f4f4f5',
                padding: '16px 40px',
                borderRadius: 100,
                border: '1px solid #e4e4e7',
              }}
            >
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="#eab308" 
                    style={{ marginRight: 12, display: 'flex' }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span style={{ fontSize: 40, fontWeight: 900, color: '#09090b', display: 'flex' }}>{avgRating}</span>
               </div>
               <div style={{ width: 2, height: 40, background: '#e4e4e7', display: 'flex', margin: '0 24px' }} />
               <div style={{ fontSize: 28, fontWeight: 700, color: '#71717a', display: 'flex' }}>
                 {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
               </div>
            </div>

            {/* Verified Badge */}
            {isVerified && (
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 32px',
                  background: '#eff6ff',
                  borderRadius: 100,
                  border: '1px solid #dbeafe',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ marginRight: 8, display: 'flex' }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex' }}>
                    Empresa Verificada
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.8,
            }}
          >
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              background: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: 12 
            }}>
               <div style={{ color: 'white', fontSize: 18, fontWeight: 900 }}>A</div>
            </div>
            <span style={{ fontSize: 22, color: '#09090b', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex' }}>AVALIA PRUDENTE</span>
            <span style={{ fontSize: 16, color: '#71717a', fontWeight: 600, letterSpacing: '2px', display: 'flex', marginLeft: 12 }}>• PLATAFORMA NFC</span>
          </div>
        </div>
      ),
      {
        ...size,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('OG Image Generation Error:', error)
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            fontWeight: 900,
          }}
        >
          <div style={{ display: 'flex' }}>Avalia Prudente</div>
          <div style={{ fontSize: 20, color: '#71717a', marginTop: 10, display: 'flex' }}>avaliaprudente.com.br</div>
        </div>
      ),
      { ...size }
    )
  }
}
