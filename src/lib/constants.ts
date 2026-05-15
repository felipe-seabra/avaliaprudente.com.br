export const APP_CONFIG = {
  name: 'Avalia Prudente',
  description: 'Gestão inteligente de avaliações Google',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
