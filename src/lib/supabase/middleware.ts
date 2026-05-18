import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug issues with sessions being lost.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role = 'customer'
  let isBlocked = false
  let accountStatus = 'active'
  let suspendedUntil: string | null = null

  if (user) {
    console.log(`Middleware [Session]: User ${user.id} found. Metadata role: ${user.app_metadata?.role || 'none'}`)
    
    // 1. Initial assignment from JWT (fast path)
    if (user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin') {
       role = 'admin'
    }

    // 2. Authoritative check from DB (always try to refresh)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_blocked, account_status, suspended_until')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error(`Middleware [DB Error]: Profile fetch failed for ${user.id}`, profileError.message)
      // We don't overwrite 'role' here to preserve JWT fallback if DB fails
    } else if (profile) {
      console.log(`Middleware [DB Success]: Profile loaded for ${user.id}. Role: ${profile.role}`)
      role = profile.role
      isBlocked = profile.is_blocked
      accountStatus = profile.account_status || 'active'
      suspendedUntil = profile.suspended_until
    } else {
      console.warn(`Middleware [DB Warning]: No profile row for ${user.id}`)
    }
  }

  return { supabaseResponse, user, role, isBlocked, accountStatus, suspendedUntil }
}
