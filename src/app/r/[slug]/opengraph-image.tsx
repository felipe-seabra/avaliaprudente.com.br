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
 * Using base64 ensures the image is fully loaded before Satori starts rendering.
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000) // 4s timeout to avoid hanging Edge function
    })
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Failed to fetch logo for OG:', url, error)
    return null
  }
}

/**
 * Normalizes hex color and ensures it has a valid format for Satori
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

    const businessName = data.businesses.name
    const businessLogo = data.businesses.logo_url
    
    // Robust URL construction for the logo
    const absoluteLogoUrl = businessLogo 
      ? (businessLogo.startsWith('http') ? businessLogo : `${APP_CONFIG.url.replace(/\/$/, '')}/${businessLogo.replace(/^\//, '')}`)
      : null

    // Pre-fetch logo to base64 for stability in Satori
    const logoBase64 = absoluteLogoUrl ? await getBase64Image(absoluteLogoUrl) : null

    const isVerified = data.businesses.is_verified
    const themeConfig = (data.theme_config || {}) as ThemeConfig
    const primaryColor = normalizeColor(themeConfig.primary_color)
    
    // Defensive review fetch
    let reviews: {rating: number}[] = []
    try {
        reviews = await reviewRepo.getByBusinessId(data.business_id)
    } catch (e) {
        console.error('Failed to fetch reviews for OG:', e)
    }

    const reviewCount = reviews.length
    const avgRating = reviewCount > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
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
          {/* Decorative Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '400px',
              display: 'flex',
              background: `linear-gradient(to bottom, ${primaryColor}20, transparent)`,
            }}
          />
          
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: 200,
              background: primaryColor,
              opacity: 0.05,
              display: 'flex',
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
              border: `6px solid ${primaryColor}40`,
              background: 'white',
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
                  padding: '8px 24px',
                  background: '#eff6ff',
                  borderRadius: 100,
                  border: '1px solid #dbeafe',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex' }}>
                  Empresa Verificada
                </span>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
              </svg>
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
    console.error('OG Render Error:', error)
    return new ImageResponse(
      (
        <div style={{ background: '#7c3aed', width: 1200, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 60 }}>
          Avalia Prudente
        </div>
      ),
      { ...size }
    )
  }
}
