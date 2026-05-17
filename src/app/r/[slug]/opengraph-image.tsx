import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository } from '@/core/infrastructure/repositories/supabase-page-repository'

// Route segment config
export const runtime = 'edge'

interface ThemeConfig {
  primary_color?: string
}

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fetch data
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  const data = await pageRepo.getBySlug(slug)

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
        width: 1200,
        height: 630,
      }
    )
  }

  const businessName = data.businesses.name
  const businessLogo = data.businesses.logo_url
  const themeConfig = (data.theme_config || {}) as ThemeConfig
  const primaryColor = themeConfig.primary_color || '#7c3aed'

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
        {/* Decorative Background Element */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: primaryColor,
            opacity: 0.05,
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: primaryColor,
            opacity: 0.05,
          }}
        />

        {/* Logo Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '240px',
            height: '240px',
            borderRadius: '120px',
            overflow: 'hidden',
            border: `8px solid ${primaryColor}1a`,
            background: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            marginBottom: '40px',
          }}
        >
          {businessLogo ? (
            <img
              src={businessLogo}
              alt={businessName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '20px',
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
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 'black',
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            {businessName}
          </h1>
          <p
            style={{
              fontSize: 24,
              fontWeight: 'medium',
              color: '#666',
              marginTop: '16px',
              textTransform: 'uppercase',
              letterSpacing: '4px',
            }}
          >
            Plataforma NFC • Avalia Prudente
          </p>
        </div>

        {/* Footer Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: 16, color: '#999', fontWeight: 'bold' }}>POWERED BY</span>
          <span style={{ fontSize: 16, color: primaryColor, fontWeight: 'black' }}>AVALIA PRUDENTE</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
