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

/**
 * Robust fetch for assets to avoid Satori crashes.
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url, { 
      next: { revalidate: 86400 }, // Cache for 24h
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
    console.error('Failed to fetch asset for OG:', url, error)
    return null
  }
}

// Image generation
export default async function Image() {
  // Try to load the official logo
  const logoUrl = `${APP_CONFIG.url}/branding/logo-horizontal.webp`
  const logoBase64 = await getBase64Image(logoUrl)

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
        {/* Decorative Glow - Using rgba instead of transparent to avoid Satori crashes */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(9, 9, 11, 0) 70%)',
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
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(9, 9, 11, 0) 70%)',
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
              marginBottom: '60px',
            }}
          >
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt={APP_CONFIG.name}
                style={{
                  height: '100px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  <div style={{ color: 'white', fontSize: 48, fontWeight: 900 }}>A</div>
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
            )}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            A plataforma definitiva para avaliações e reputação digital via NFC
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              marginTop: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 40px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed', display: 'flex' }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '4px', textTransform: 'uppercase' }}>
              NFC TECHNOLOGY
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 22,
            color: '#52525b',
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
