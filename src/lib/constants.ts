export const APP_CONFIG = {
  name: 'Avalia Prudente',
  description: 'Plataforma NFC Inteligente para Negócios Locais',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  whatsappOrderNumber: '5518997380486', // Centralized WhatsApp number for orders
}

export const PRICING_PLANS = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    maxBusinesses: 1,
    features: ['1 empresa', 'Acesso via QR Code', 'Página pública', 'Avaliações básicas', 'Analytics básico'],
    enabled: true,
  },
  PRO: {
    name: 'Pro',
    price: 9.90,
    maxBusinesses: 4,
    features: ['Até 4 empresas', 'Analytics avançado', 'Customização avançada', 'Suporte prioritário'],
    enabled: false, // Coming soon
  },
  BUSINESS: {
    name: 'Business',
    price: 69.90,
    maxBusinesses: 10,
    features: ['Até 10 empresas', 'Incluso 1 Tag NFC', 'Premium Analytics', 'Destaque na Home', 'Suporte VIP'],
    enabled: false, // Coming soon
  }
}

export const DESIGN_SYSTEM = {
  radius: '0.625rem',
  fontSans: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
}

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  callback: '/auth/callback',
  dashboard: '/dashboard',
}
