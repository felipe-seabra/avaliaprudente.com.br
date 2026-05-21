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
  const next = getSafeInternalRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  if (next.startsWith('/r/')) {
    return NextResponse.redirect(`${origin}${appendAuthError(next)}`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
