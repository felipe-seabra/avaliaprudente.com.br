import { NextRequest } from 'next/server'

/**
 * Validates the Origin and Host headers to prevent CSRF attacks.
 * This is primarily effective for API routes (Next.js Server Actions 
 * do this automatically in v14+).
 * 
 * @param request The incoming NextRequest
 * @returns true if the request is safe, false if it should be blocked
 */
export function validateCSRF(request: NextRequest): boolean {
  // Safe methods do not require CSRF protection
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const xForwardedHost = request.headers.get('x-forwarded-host')
  
  // Use X-Forwarded-Host if available (e.g. behind a proxy/load balancer)
  const effectiveHost = xForwardedHost || host

  // If there's no Origin header on a POST/PUT/DELETE, it's either:
  // 1. A server-to-server request (should use API keys, handled separately or bypass CSRF if webhook)
  // 2. An old browser / curl (could be malicious)
  // 3. A same-origin request where the browser decided not to send Origin (rare in modern browsers)
  if (!origin) {
    // For maximum security, we require the Origin header on state-changing requests
    // from clients. If it's not present, we block it.
    // If it's a valid server-to-server request, it should be excluded via route matching (e.g. webhooks).
    return false
  }

  try {
    const originUrl = new URL(origin)
    
    // Compare the origin's host with the request's effective host
    if (originUrl.host !== effectiveHost) {
      console.warn(`[Security] CSRF Validation Failed. Origin: ${originUrl.host}, Expected Host: ${effectiveHost}`)
      return false
    }
  } catch {
    console.error('[Security] Invalid Origin header format:', origin)
    return false
  }

  return true
}

/**
 * Generates robust Content Security Policy (CSP) headers.
 */
export function generateSecurityHeaders(): Record<string, string> {
  // Using a nonce for scripts in Next.js is complex and requires custom Document configuration.
  // Instead, we use a strict CSP that allows Next.js specific requirements while blocking malicious sources.
  // We allow 'unsafe-inline' for styles because many UI libraries (like Radix/Shadcn) require it.
  // We restrict scripts to self and specific trusted domains (like Google Analytics if used).
  
  const isDev = process.env.NODE_ENV === 'development'
  
  const csp = [
    "default-src 'self'",
    // Allow scripts from self. Next.js development needs unsafe-eval for Fast Refresh.
    `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://www.googletagmanager.com`,
    // Allow styles from self and inline (required by standard UI libraries/Next.js)
    "style-src 'self' 'unsafe-inline'",
    // Allow images from self, data URIs, and our Supabase storage
    "img-src 'self' blob: data: https://*.supabase.co",
    // Allow fonts from self and data URIs
    "font-src 'self' data:",
    // Allow connections to self, Supabase API, and our domain
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
    // Allow iframe embedding only from self (if needed, otherwise 'none')
    "frame-src 'self'",
    // Prevent our site from being framed by others
    "frame-ancestors 'none'",
    // Base URI restriction
    "base-uri 'self'",
    // Form actions restricted to self
    "form-action 'self'",
    // Upgrade insecure requests in production
    isDev ? "" : "upgrade-insecure-requests"
  ].filter(Boolean).join('; ')

  return {
    'Content-Security-Policy': csp,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  }
}
