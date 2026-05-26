import { SUBSCRIPTION_PLANS as TECH_PLANS, PLAN_SLUGS } from './subscription-config'

const getProductionUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && envUrl.includes('avaliaprudente.com.br') && !envUrl.includes('www.avaliaprudente.com.br')) {
    return envUrl.replace('avaliaprudente.com.br', 'www.avaliaprudente.com.br')
  }
  return envUrl || 'https://www.avaliaprudente.com.br'
}

export const APP_CONFIG = {
  name: 'Avalia Prudente',
  description: 'Plataforma NFC Inteligente para Negócios Locais',
  url: process.env.NODE_ENV === 'production' ? getProductionUrl() : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  whatsappOrderNumber: '5518998230188', // Centralized WhatsApp number for orders
  currentTermsVersion: '1.2', // Current version of terms of use
  version: '0.20.0', // Application version
}

export const PRICING_PLANS = {
  FREE: {
    name: TECH_PLANS[PLAN_SLUGS.FREE].name,
    price: TECH_PLANS[PLAN_SLUGS.FREE].price,
    maxBusinesses: TECH_PLANS[PLAN_SLUGS.FREE].quotas.business_limit,
    features: ['1 empresa', 'Acesso via QR Code', 'Página pública', 'Avaliações básicas', 'Analytics básico'],
    enabled: TECH_PLANS[PLAN_SLUGS.FREE].enabled,
  },
  PRO: {
    name: TECH_PLANS[PLAN_SLUGS.PRO].name,
    price: TECH_PLANS[PLAN_SLUGS.PRO].price,
    maxBusinesses: TECH_PLANS[PLAN_SLUGS.PRO].quotas.business_limit,
    features: ['Até 4 empresas', 'Analytics avançado', 'Customização avançada', 'Tags vendidas separadamente'],
    enabled: TECH_PLANS[PLAN_SLUGS.PRO].enabled,
  },
  BUSINESS: {
    name: TECH_PLANS[PLAN_SLUGS.BUSINESS].name,
    price: TECH_PLANS[PLAN_SLUGS.BUSINESS].price,
    setupFee: TECH_PLANS[PLAN_SLUGS.BUSINESS].setupFee,
    maxBusinesses: TECH_PLANS[PLAN_SLUGS.BUSINESS].quotas.business_limit,
    features: ['Até 10 empresas', 'Incluso 1 Tag NFC (ativação)', 'Premium Analytics', 'Destaque na Home', 'Suporte VIP'],
    enabled: TECH_PLANS[PLAN_SLUGS.BUSINESS].enabled,
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
