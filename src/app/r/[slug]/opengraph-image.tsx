import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { ReviewLinkRepository } from '@/core/infrastructure/repositories/supabase-review-link-repository'
import { Business, BusinessPage } from '@/core/domain/entities'

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

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fetch data
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  const reviewRepo = new ReviewRepository(supabase)
  const reviewLinkRepo = new ReviewLinkRepository(supabase)
  
  // Resolve business data (supports direct business slugs and review link slugs)
  let data = await pageRepo.getBySlug(slug) as PageWithBusiness | null
  
  if (!data) {
    const reviewLink = await reviewLinkRepo.getBySlug(slug)
    if (reviewLink) {
      data = await pageRepo.getByBusinessId(reviewLink.business_id) as PageWithBusiness | null
      if (!data) {
        // Fallback if business has no page yet
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
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            fontWeight: 'bold',
          }}
        >
          Avalia Prudente
        </div>
      ),
      {
        ...size,
      }
    )
  }

  const businessName = data.businesses.name
  const businessLogo = data.businesses.logo_url
  const isVerified = data.businesses.is_verified
  const themeConfig = (data.theme_config || {}) as ThemeConfig
  const primaryColor = themeConfig.primary_color || '#7c3aed'

  // Fetch reviews for dynamic stats
  const reviews = await reviewRepo.getByBusinessId(data.business_id)
  const reviewCount = reviews.length
  const avgRating = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : '5.0'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
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
            background: `linear-gradient(to bottom, ${primaryColor}10, transparent)`,
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: primaryColor,
            opacity: 0.03,
          }}
        />

        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            borderRadius: '45px',
            overflow: 'hidden',
            border: `6px solid ${primaryColor}20`,
            background: 'white',
            boxShadow: '0 15px 30px rgba(0,0,0,0.06)',
            marginBottom: '32px',
          }}
        >
          {businessLogo ? (
            <img
              src={businessLogo}
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
                fontWeight: 'bold',
                color: primaryColor,
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
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#09090b',
              margin: 0,
              letterSpacing: '-3px',
              lineHeight: 1.1,
            }}
          >
            {businessName}
          </div>

          {/* Stats Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '32px',
              background: '#f4f4f5',
              padding: '12px 32px',
              borderRadius: '100px',
              border: '1px solid #e4e4e7',
            }}
          >
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: 32, color: '#eab308' }}>★</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#09090b' }}>{avgRating}</span>
             </div>
             <div style={{ width: 2, height: 32, background: '#e4e4e7' }} />
             <div style={{ fontSize: 24, fontWeight: 600, color: '#71717a' }}>
               {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
             </div>
          </div>

          {/* Verified Badge */}
          {isVerified && (
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2563eb',
                padding: '6px 16px',
                background: '#eff6ff',
                borderRadius: '100px',
                border: '1px solid #dbeafe',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Empresa Verificada
              </span>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 20, color: '#09090b', fontWeight: 900, letterSpacing: '-0.5px' }}>AVALIA PRUDENTE</span>
          <span style={{ fontSize: 16, color: '#71717a', fontWeight: 500, letterSpacing: '1px' }}>• PLATAFORMA NFC</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
