import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { APP_CONFIG } from '@/lib/constants'
import { checkRateLimit } from '@/lib/rate-limit'
import { generatePrivacyFingerprint } from '@/lib/privacy'
import { validateCSRF, generateSecurityHeaders } from '@/lib/security'
import { logger } from '@/lib/logger'
import { logAuditEvent } from '@/lib/audit-logger'

export async function middleware(request: NextRequest) {
  // 1. Precise IP Extraction (Safe X-Forwarded-For handling)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''
  
  // 2. Generate Privacy-safe identifier (Daily rotation)
  const identifier = await generatePrivacyFingerprint(ip, userAgent, 'daily')

  // 3. Determine Rate Limit Tier
  let limitType: 'global' | 'api' | 'auth' = 'global'
  if (request.nextUrl.pathname.startsWith('/api')) {
    limitType = 'api'
  }
  if (
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password')
  ) {
    limitType = 'auth'
  }

  // 4. Distributed Rate Limiting Check
  const { success, limit, remaining, reset } = await checkRateLimit(identifier, limitType)

  if (!success) {
    await logger.security('Rate limit violation', {
      limitType,
      limit,
      fingerprint: identifier,
    }, request)

    // Log to DB for persistent audit
    await logAuditEvent({
      action: 'security/rate-limit-violation',
      resourceType: 'system',
      metadata: { limitType, limit, fingerprint: identifier }
    })

    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      }
    })
  }

  // Canonical Domain Normalization (non-www -> www)
  // This prevents session inconsistencies and auth mismatches in production
  const host = request.headers.get('host')
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && host === 'avaliaprudente.com.br') {
    const wwwUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.avaliaprudente.com.br')
    return NextResponse.redirect(wwwUrl, 301)
  }

  const { supabaseResponse, user, role, isBlocked, isDeleted, accountStatus, suspendedUntil, termsVersion } = await updateSession(request)

  // Inject Rate Limit headers into the response for visibility/observability
  supabaseResponse.headers.set('X-RateLimit-Limit', limit.toString())
  supabaseResponse.headers.set('X-RateLimit-Remaining', remaining.toString())
  supabaseResponse.headers.set('X-RateLimit-Reset', reset.toString())

  // Apply Security Headers (CSP, X-Frame-Options, etc.)
  const securityHeaders = generateSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  // Log CSRF failure if occurred (now with user if available)
  const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks')
  if (!isWebhook && !validateCSRF(request)) {
    await logger.security('CSRF validation failure', {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    }, request)

    // Log to DB for persistent audit
    await logAuditEvent({
      action: 'security/csrf-violation',
      resourceType: 'request',
      actorId: user?.id,
      metadata: { 
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    })

    return new NextResponse('Invalid CSRF Token or Origin', { status: 403 })
  }

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isBlockedPage = request.nextUrl.pathname.startsWith('/blocked')
  const isTermsPage = request.nextUrl.pathname.startsWith('/terms-reaccept')

  const isAdmin = role === 'admin' || role === 'super_admin'
  const isReviewer = role === 'reviewer'
  const isSuspended = !isAdmin && accountStatus === 'suspended' && (!suspendedUntil || new Date(suspendedUntil) > new Date())
  const isBanned = !isAdmin && accountStatus === 'banned'
  const isUserDeleted = !isAdmin && isDeleted
  const isUserBlocked = !isAdmin && (isBlocked || isBanned || isUserDeleted)
  
  const needsTermsReacceptance = user && !isAdmin && termsVersion !== APP_CONFIG.currentTermsVersion

  // DEBUG LOGS
  if (process.env.NODE_ENV === 'development' && (isAdminPage || isDashboardPage || isBlockedPage || isAuthPage || isTermsPage)) {
    console.log(`Middleware [${request.nextUrl.pathname}]: User: ${user?.id || 'none'}, Role: ${role}, isAdmin: ${isAdmin}, isReviewer: ${isReviewer}, Status: ${accountStatus}, Deleted: ${isDeleted}, NeedsTerms: ${needsTermsReacceptance}`)
  }

  // 1. Admin Master Bypass: If admin is logged in, they bypass all moderation blocks
  if (user && isAdmin) {
    if (isAuthPage) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware: Admin at Auth Page -> Redirecting to /admin/dashboard')
      }
      const response = NextResponse.redirect(new URL('/admin/dashboard', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }
    // Allow admin to access anything (dashboard or admin panel)
    return supabaseResponse
  }

  // 2. Terms Re-acceptance (Regular users only)
  if (needsTermsReacceptance && !isTermsPage && (isDashboardPage || isAdminPage)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware: User needs terms re-acceptance -> Redirecting to /terms-reaccept')
    }
    const response = NextResponse.redirect(new URL('/terms-reaccept', request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // 3. Permanent Block / Ban / Deactivation check (Regular users only)
  if (user && isUserBlocked && !isBlockedPage) {
    const type = isUserDeleted ? 'deleted' : (isBanned ? 'banned' : 'blocked')
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware: Blocked/Banned/Deleted User (${type}) -> Redirecting to /blocked`)
    }
    const response = NextResponse.redirect(new URL(`/blocked${type !== 'blocked' ? `?type=${type}` : ''}`, request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // 4. Temporary Suspension check (Regular users only)
  if (user && isSuspended && (isDashboardPage || isAdminPage) && !isBlockedPage) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware: Suspended User -> Redirecting to /blocked?type=suspended')
    }
    const response = NextResponse.redirect(new URL('/blocked?type=suspended', request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // 5. Redirect away from /blocked if not actually blocked
  if (user && !isUserBlocked && !isSuspended && isBlockedPage) {
    const target = isReviewer ? '/account' : '/dashboard'
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware: Not Blocked User at /blocked -> Redirecting to ${target}`)
    }
    const response = NextResponse.redirect(new URL(target, request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // 6. Redirect logged in users away from auth pages
  if (user && isAuthPage) {
    const target = isReviewer ? '/account' : '/dashboard'
    if (process.env.NODE_ENV === 'development') {
      console.log(`Middleware: Logged in User at Auth Page -> Redirecting to ${target}`)
    }
    const response = NextResponse.redirect(new URL(target, request.url))
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  // 7. Protect dashboard and enforce reviewer restrictions
  if (isDashboardPage) {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware: Anonymous User at Dashboard -> Redirecting to /login')
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }

    if (isReviewer) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Middleware: Reviewer user ${user.id} attempted to access dashboard -> Redirecting to /account`)
      }
      const response = NextResponse.redirect(new URL('/account', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }
  }

  // 8. Protect admin routes (Double check for security)
  if (isAdminPage) {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware: Anonymous User at Admin Page -> Redirecting to /login')
      }
      const response = NextResponse.redirect(new URL('/login', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }

    if (!isAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Middleware: Non-admin user ${user.id} attempted to access ${request.nextUrl.pathname} -> Redirecting to /dashboard`)
      }
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
