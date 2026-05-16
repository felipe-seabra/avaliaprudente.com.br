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
          width: '100%',
          height: '100%',
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
            {/* We'll use a text-based logo representation since we can't reliably load external assets in OG without more setup */}
            <div
              style={{
                background: '#7c3aed',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '24px',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.4)',
              }}
            >
              <svg
                width="40"
                height="40"
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
                fontSize: 72,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-2px',
              }}
            >
              Avalia Prudente
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              letterSpacing: '-0.5px',
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
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '2px', textTransform: 'uppercase' }}>
              NFC TECHNOLOGY
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 18,
            color: '#52525b',
            fontWeight: 500,
          }}
        >
          {APP_CONFIG.url.replace('https://', '')}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
