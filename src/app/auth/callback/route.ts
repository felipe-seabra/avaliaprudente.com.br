import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APP_CONFIG } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use centralized production-aware URL
      return NextResponse.redirect(`${APP_CONFIG.url}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${APP_CONFIG.url}/auth/auth-code-error`)
}
