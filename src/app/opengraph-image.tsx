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
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
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
          {/* Logo Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                background: '#7c3aed',
                width: '100px',
                height: '100px',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '32px',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
              }}
            >
              <svg
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-3px',
                display: 'flex',
              }}
            >
              Avalia Prudente
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
              letterSpacing: '-0.5px',
              display: 'flex',
            }}
          >
            A plataforma NFC para avaliações e reputação digital
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              marginTop: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 32px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed', display: 'flex' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '3px', textTransform: 'uppercase' }}>
              NFC TECHNOLOGY
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 20,
            color: '#52525b',
            fontWeight: 600,
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
