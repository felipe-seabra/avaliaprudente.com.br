import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { APP_CONFIG } from '@/lib/constants'

// Basic rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

// Simple in-memory storage for rate limiting
const ipCache = new Map<string, { count: number; lastReset: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const stats = ipCache.get(ip) || { count: 0, lastReset: now }

  if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
    stats.count = 1
    stats.lastReset = now
  } else {
    stats.count++
  }

  ipCache.set(ip, stats)
  return stats.count > MAX_REQUESTS
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  
  // Rate limiting check
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
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
  if (isAdminPage || isDashboardPage || isBlockedPage || isAuthPage || isTermsPage) {
    console.log(`Middleware [${request.nextUrl.pathname}]: User: ${user?.id || 'none'}, Role: ${role}, isAdmin: ${isAdmin}, isReviewer: ${isReviewer}, Status: ${accountStatus}, Deleted: ${isDeleted}, NeedsTerms: ${needsTermsReacceptance}`)
  }

  // 1. Admin Master Bypass: If admin is logged in, they bypass all moderation blocks
  if (user && isAdmin) {
    if (isAuthPage) {
      console.log('Middleware: Admin at Auth Page -> Redirecting to /admin/dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    // Allow admin to access anything (dashboard or admin panel)
    return supabaseResponse
  }

  // 2. Terms Re-acceptance (Regular users only)
  if (needsTermsReacceptance && !isTermsPage && (isDashboardPage || isAdminPage)) {
    console.log('Middleware: User needs terms re-acceptance -> Redirecting to /terms-reaccept')
    return NextResponse.redirect(new URL('/terms-reaccept', request.url))
  }

  // 3. Permanent Block / Ban / Deactivation check (Regular users only)
  if (user && isUserBlocked && !isBlockedPage) {
    const type = isUserDeleted ? 'deleted' : (isBanned ? 'banned' : 'blocked')
    console.log(`Middleware: Blocked/Banned/Deleted User (${type}) -> Redirecting to /blocked`)
    return NextResponse.redirect(new URL(`/blocked${type !== 'blocked' ? `?type=${type}` : ''}`, request.url))
  }

  // 4. Temporary Suspension check (Regular users only)
  if (user && isSuspended && (isDashboardPage || isAdminPage) && !isBlockedPage) {
    console.log('Middleware: Suspended User -> Redirecting to /blocked?type=suspended')
    return NextResponse.redirect(new URL('/blocked?type=suspended', request.url))
  }

  // 5. Redirect away from /blocked if not actually blocked
  if (user && !isUserBlocked && !isSuspended && isBlockedPage) {
    const target = isReviewer ? '/account' : '/dashboard'
    console.log(`Middleware: Not Blocked User at /blocked -> Redirecting to ${target}`)
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 6. Redirect logged in users away from auth pages
  if (user && isAuthPage) {
    const target = isReviewer ? '/account' : '/dashboard'
    console.log(`Middleware: Logged in User at Auth Page -> Redirecting to ${target}`)
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 7. Protect dashboard and enforce reviewer restrictions
  if (isDashboardPage) {
    if (!user) {
      console.log('Middleware: Anonymous User at Dashboard -> Redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isReviewer) {
      console.warn(`Middleware: Reviewer user ${user.id} attempted to access dashboard -> Redirecting to /account`)
      return NextResponse.redirect(new URL('/account', request.url))
    }
  }

  // 8. Protect admin routes (Double check for security)
  if (isAdminPage) {
    if (!user) {
      console.log('Middleware: Anonymous User at Admin Page -> Redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!isAdmin) {
      console.warn(`Middleware: Non-admin user ${user.id} attempted to access ${request.nextUrl.pathname} -> Redirecting to /dashboard`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
