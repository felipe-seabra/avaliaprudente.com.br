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
    // 1. Fallback: Trust JWT metadata if present (fast path)
    if (user.app_metadata?.role) {
       role = user.app_metadata.role
    } else if (user.user_metadata?.role) {
       role = user.user_metadata.role
    }

    // 2. Authoritative: Fetch from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_blocked, account_status, suspended_until')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Middleware Error: Failed to fetch profile', {
        userId: user.id,
        error: profileError,
        code: profileError.code,
        message: profileError.message
      })
      // If we couldn't fetch profile but JWT says admin, we'll keep the JWT role for bypass
    }

    if (profile) {
      console.log('Middleware Success: Profile loaded', {
        userId: user.id,
        role: profile.role,
        accountStatus: profile.account_status
      })
      role = profile.role
      isBlocked = profile.is_blocked
      accountStatus = profile.account_status || 'active'
      suspendedUntil = profile.suspended_until
    } else {
      console.warn('Middleware Warning: No profile found for user', user.id)
    }
  }

  return { supabaseResponse, user, role, isBlocked, accountStatus, suspendedUntil }
}
