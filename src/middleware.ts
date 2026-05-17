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

  const { supabaseResponse, user, role, isBlocked } = await updateSession(request)

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isBlockedPage = request.nextUrl.pathname.startsWith('/blocked')

  if (user && isBlocked && !isBlockedPage) {
    // If blocked user tries to access anything other than /blocked, sign them out / redirect
    // Redirect to blocked page
    return NextResponse.redirect(new URL('/blocked', request.url))
  }

  if (user && !isBlocked && isBlockedPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect logged in users away from auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect admin routes
  if (isAdminPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (role !== 'admin') {
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
