import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { RootProvider } from '@/providers/root-provider'
import { APP_CONFIG } from '@/lib/constants'
import { validateEnv } from '@/lib/env'
import { CookieConsent } from '@/components/shared/cookie-consent'

// Validate environment variables on startup
validateEnv()

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    template: '%s | Avalia Prudente',
    default: 'Avalia Prudente | Plataforma NFC para Negócios Locais',
  },
  description: 'Transforme seu balcão em uma central de conexões digitais. Aumente suas avaliações no Google com Tags NFC inteligentes e redirecionamento estratégico.',
  keywords: ['NFC', 'Avaliações Google', 'Marketing Local', 'Cartão de Visita Digital', 'Review', 'Google Meu Negócio'],
  authors: [{ name: 'Avalia Prudente' }],
  creator: 'Avalia Prudente',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.avaliaprudente.com.br',
    title: 'Avalia Prudente | Plataforma NFC Inteligente',
    description: 'A plataforma definitiva para avaliações e reputação digital via NFC.',
    siteName: 'Avalia Prudente',
    images: [
      {
        url: '/branding/og-logo.png',
        width: 1200,
        height: 630,
        alt: 'Avalia Prudente',
      },
    ],
  },
    alternates: {
    canonical: 'https://www.avaliaprudente.com.br',
  }, 
  twitter: {
    card: 'summary_large_image',
    title: 'Avalia Prudente | Plataforma NFC Inteligente',
    description: 'Transforme clientes em avaliações reais com tecnologia NFC.',
    images: ['/branding/og-logo.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <RootProvider>
          {children}
          <CookieConsent />
        </RootProvider>
      </body>
    </html>
  )
}
