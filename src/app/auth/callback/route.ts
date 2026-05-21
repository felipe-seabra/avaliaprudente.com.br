import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeInternalRedirect } from '@/lib/auth-redirect'

function appendAuthError(path: string) {
  const url = new URL(path, 'http://internal.local')
  url.searchParams.set('auth_error', '1')

  return `${url.pathname}${url.search}`
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Robust parameter extraction: check both 'next' and 'redirect_to'
  const rawNext = searchParams.get('next') || searchParams.get('redirect_to')
  const next = getSafeInternalRedirect(rawNext)

  // Check for authentication errors returned by Supabase
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('[Auth Callback] error:', error, errorDescription)
    
    // If it's a review flow, return to the page with an error marker
    if (next.startsWith('/r/')) {
      return NextResponse.redirect(`${origin}${appendAuthError(next)}`)
    }
    
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Use URL constructor for safer redirect
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl.toString())
    }

    console.error('[Auth Callback] exchange error:', exchangeError.message)
  }

  // Fallback for failed exchange or missing code
  if (next.startsWith('/r/')) {
    return NextResponse.redirect(`${origin}${appendAuthError(next)}`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
