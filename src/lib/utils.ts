import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Generates a lightweight, privacy-aware browser fingerprint.
 * Combines stable browser characteristics into a hash.
 */
export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server-side'

  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    window.screen.width.toString(),
    window.screen.height.toString(),
    window.screen.colorDepth.toString(),
    // Simple canvas fingerprinting (non-aggressive)
    (() => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return ''
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('AvaliaPrudente', 2, 2)
        return canvas.toDataURL()
      } catch {
        return ''
      }
    })()
  ]

  const message = components.join('|')
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const RESERVED_SLUGS = [
  'admin', 'dashboard', 'login', 'register', 'api', 'blocked', 
  'terms-reaccept', 'privacy', 'terms', 'auth', 'reset-password', 
  'forgot-password', 'favicon.ico', 'sitemap.xml', 'robots.txt', 
  'demo', 'demonstracao', 'new', 'edit', 'delete', 'settings',
  'support', 'help', 'pricing', 'about', 'contact', 'r'
]

/**
 * Normalizes a string into a URL-safe slug.
 * - Lowercase
 * - Accent-normalized
 * - Non-alphanumeric removed (replaced with -)
 * - Trimmed
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '-')     // Replace non-alphanumeric with -
    .replace(/-+/g, '-')            // Remove consecutive -
    .replace(/^-|-$/g, '')          // Trim - from start and end
}

/**
 * Validates if a slug is safe to use.
 * - Not in RESERVED_SLUGS
 * - No special characters except -
 * - Length between 2 and 50
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false
  if (slug.length < 2 || slug.length > 50) return false
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false
  
  // Standard slug pattern
  const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return pattern.test(slug)
}

/**
 * Validates if a URL is safe for server-side fetching (SSRF protection).
 * - Only http/https
 * - No localhost
 * - No private IP ranges
 * - No cloud metadata endpoints
 */
export function isValidSafeRemoteUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const parsedUrl = new URL(url)
    
    // 1. Only allow http and https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false
    
    const hostname = parsedUrl.hostname.toLowerCase()
    
    // 2. Block localhost and loopback
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname === '[::1]' || 
      hostname === '0.0.0.0'
    ) return false
    
    // 3. Block private IP ranges (RFC 1918)
    // 10.0.0.0/8
    if (hostname.startsWith('10.')) return false
    // 172.16.0.0/12
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return false
    // 192.168.0.0/16
    if (hostname.startsWith('192.168.')) return false
    
    // 4. Block Cloud Metadata endpoints
    if (hostname === '169.254.169.254') return false
    
    // 5. Block simple hostnames without dots (likely internal services)
    // unless it's a known safe short domain
    if (!hostname.includes('.')) return false
    
    return true
  } catch {
    return false
  }
}

/**
 * Validates if a URL is a legitimate Google Review link.
 */
export function isValidGoogleReviewUrl(url: string): boolean {
  if (!url) return false
  
  // common Google Review URL patterns
  const patterns = [
    /search\.google\.com\/local\/writereview/i,
    /g\.page\/r\/[a-zA-Z0-9_-]+\/review/i,
    /g\.page\/[a-zA-Z0-9_-]+\/review/i,
    /goo\.gl\/maps\/[a-zA-Z0-9]+/i,
    /maps\.app\.goo\.gl\/[a-zA-Z0-9]+/i,
    /google\.com\/maps\/place/i,
    /business\.google\.com\/reviews/i,
    /google\.com\/search\?.*q=.*#lrd=/i
  ]
  
  try {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return false
    
    const parsedUrl = new URL(trimmedUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false
    
    // Check if it's a known Google domain or one of the shorteners
    const allowedDomains = [
      'google.com', 
      'google.com.br', 
      'g.page', 
      'goo.gl', 
      'maps.app.goo.gl'
    ]
    
    const hasAllowedDomain = allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    )

    if (!hasAllowedDomain) return false

    return patterns.some(pattern => pattern.test(trimmedUrl))
  } catch {
    return false
  }
}
