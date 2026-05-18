import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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

  const { supabaseResponse, user, role, isBlocked, accountStatus, suspendedUntil } = await updateSession(request)

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isBlockedPage = request.nextUrl.pathname.startsWith('/blocked')

  const isAdmin = role === 'admin'
  const isSuspended = !isAdmin && accountStatus === 'suspended' && (!suspendedUntil || new Date(suspendedUntil) > new Date())
  const isUserBlocked = !isAdmin && isBlocked

  // DEBUG LOGS
  if (isAdminPage || isDashboardPage || isBlockedPage) {
    console.log(`Middleware [${request.nextUrl.pathname}]:`, {
      userId: user?.id,
      role,
      isAdmin,
      isUserBlocked,
      isSuspended
    })
  }

  // 1. Admin Master Bypass: If admin is logged in, they bypass all moderation blocks
  if (user && isAdmin) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    // Allow admin to access anything (dashboard or admin panel)
    return supabaseResponse
  }

  // 2. Permanent Block check (Regular users only)
  if (user && isUserBlocked && !isBlockedPage) {
    return NextResponse.redirect(new URL('/blocked', request.url))
  }

  // 3. Temporary Suspension check (Regular users only)
  if (user && isSuspended && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/blocked?type=suspended', request.url))
  }

  // 4. Redirect away from /blocked if not actually blocked
  if (user && !isUserBlocked && !isSuspended && isBlockedPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 5. Redirect logged in users away from auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 6. Protect dashboard
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 7. Protect admin routes (Double check for security)
  if (isAdminPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!isAdmin) {
      console.warn(`Middleware: Non-admin user ${user.id} attempted to access ${request.nextUrl.pathname}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
