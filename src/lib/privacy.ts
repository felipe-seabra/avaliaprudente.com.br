import { env } from './env'

/**
 * Privacy-hardened fingerprinting for anti-fraud and analytics.
 * 
 * Features:
 * - Deterministic but non-reversible (SHA-256 + Pepper)
 * - Ephemeral (Rotation via daily salt)
 * - PII Minimization (Raw IP/UA never stored)
 */
export async function generatePrivacyFingerprint(
  ip: string,
  userAgent: string,
  window: 'daily' | 'weekly' | 'permanent' = 'daily'
): Promise<string> {
  const pepper = env.FINGERPRINT_PEPPER || 'fallback-secure-pepper-for-dev-only'
  
  // Create an ephemeral component for the hash based on the current window
  const now = new Date()
  let windowKey = ''
  
  if (window === 'daily') {
    windowKey = now.toISOString().split('T')[0] // YYYY-MM-DD
  } else if (window === 'weekly') {
    // Get week number
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7)
    windowKey = `${now.getFullYear()}-W${week}`
  }

  // Combine IP, User Agent, Pepper, and Ephemeral Window Key
  const message = `${ip}|${userAgent}|${pepper}|${windowKey}`
  const msgUint8 = new TextEncoder().encode(message)
  
  // Use Web Crypto API (supported in Edge Runtime)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Sanitize User Agent to minimize PII while preserving useful analytics signals.
 * Extracts: Browser, Major Version, OS.
 */
export function sanitizeUserAgent(ua: string): string {
  if (!ua) return 'Unknown'
  
  // Very basic sanitization - in a real app we might use a library
  // but for LGPD compliance, the goal is to reduce uniqueness.
  const browserMatch = ua.match(/(firefox|msie|trident|chrome|safari|edg|opr)\/?\s*(\d+)/i) || []
  const osMatch = ua.match(/(windows|macintosh|linux|android|iphone|ipad)/i) || []
  
  const browser = browserMatch[1] || 'Unknown'
  const os = osMatch[1] || 'Unknown'
  
  return `${browser} on ${os}`
}
