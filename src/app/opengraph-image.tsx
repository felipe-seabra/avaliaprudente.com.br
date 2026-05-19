import { ImageResponse } from 'next/og'
import { APP_CONFIG } from '@/lib/constants'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Avalia Prudente - Plataforma NFC Inteligente'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '80px',
        }}
      >
        {/* Decorative Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(9, 9, 11, 0) 70%)',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {/* Logo Area (CSS Based for Stability) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '60px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  background: '#7c3aed',
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '32px',
                  boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
                }}
              >
                <div style={{ color: 'white', fontSize: 60, fontWeight: 900 }}>A</div>
              </div>
              <div
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  color: 'white',
                  letterSpacing: '-4px',
                  display: 'flex',
                }}
              >
                Avalia Prudente
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '950px',
              lineHeight: 1.4,
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            A tag inteligente que conecta seu balcão ao mundo digital
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              marginTop: '80px',
              display: 'flex',
              alignItems: 'center',
              padding: '16px 48px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', letterSpacing: '4px', textTransform: 'uppercase' }}>
              NFC TECHNOLOGY
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 24,
            color: '#3f3f46',
            fontWeight: 700,
            display: 'flex',
          }}
        >
          {APP_CONFIG.url.replace('https://', '')}
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  )
}
