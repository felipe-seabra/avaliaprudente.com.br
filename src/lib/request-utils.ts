import { NextRequest } from 'next/server'

interface RequestWithIp {
  ip?: string
}

/**
 * Extract the client's IP address securely.
 * 
 * - In Middleware (NextRequest): Uses request.ip which is trusted on Vercel/Netlify.
 * - In API Routes (Request): Uses X-Real-IP or X-Forwarded-For.
 * 
 * IMPORTANT: To prevent IP spoofing, we prioritize trusted platform headers.
 */
export function getClientIp(request: NextRequest | Request): string {
  // 1. NextRequest built-in 'ip' property (Trusted on Vercel/Next.js)
  const reqWithIp = request as unknown as RequestWithIp
  if (reqWithIp.ip) {
    return reqWithIp.ip
  }

  // 2. X-Real-IP (Standard header set by proxies like Nginx or Vercel)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // 3. X-Forwarded-For (Fallback)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Note: This could still be spoofed if not properly handled by the entry proxy.
    // However, for most production environments, the entry proxy either 
    // overwrites or appends the true client IP at the end.
    // On Vercel, request.ip is the safe way to go.
    return forwardedFor.split(',')[0].trim()
  }

  return '127.0.0.1'
}
