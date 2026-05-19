import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { Business, BusinessPage } from '@/core/domain/entities'
import { APP_CONFIG } from '@/lib/constants'

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
 * Robust fetch for remote images to avoid Satori crashes.
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    
    // Edge Runtime safe base64 conversion
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    const contentType = response.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Failed to fetch logo for OG:', url, error)
    return null
  }
}

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
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 64,
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
            <div style={{ marginBottom: 20, display: 'flex' }}>Avalia Prudente</div>
            <div style={{ fontSize: 24, color: '#71717a', display: 'flex' }}>avaliaprudente.com.br</div>
          </div>
        ),
        { ...size }
      )
    }

    const businessName = data.businesses.name || 'Empresa'
    const businessLogo = data.businesses.logo_url
    
    // Robust URL construction for the logo
    const absoluteLogoUrl = businessLogo 
      ? (businessLogo.startsWith('http') ? businessLogo : `${APP_CONFIG.url.replace(/\/$/, '')}/${businessLogo.replace(/^\//, '')}`)
      : null

    // Pre-fetch logo to base64
    const logoBase64 = absoluteLogoUrl ? await getBase64Image(absoluteLogoUrl) : null

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
          {/* Top decorative gradient - Using rgba instead of transparent to avoid Satori u2 error */}
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
              overflow: 'hidden',
              background: 'white',
              border: '6px solid rgba(124, 58, 237, 0.1)',
              marginBottom: 32,
            }}
          >
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt={businessName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 80,
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
                  <span style={{ fontSize: 40, color: '#eab308', display: 'flex', marginRight: 12 }}>★</span>
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
                  padding: '8px 32px',
                  background: '#eff6ff',
                  borderRadius: 100,
                  border: '1px solid #dbeafe',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex' }}>
                  Empresa Verificada
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
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
               <div style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>★</div>
            </div>
            <span style={{ fontSize: 24, color: '#09090b', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex' }}>AVALIA PRUDENTE</span>
            <span style={{ fontSize: 18, color: '#71717a', fontWeight: 600, letterSpacing: '2px', display: 'flex', marginLeft: 12 }}>• PLATAFORMA NFC</span>
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
