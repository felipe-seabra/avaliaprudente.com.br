import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { generatePrivacyFingerprint, sanitizeUserAgent } from '@/lib/privacy'
import { getClientIp } from '@/lib/request-utils'

// Use service role for trusted server-side insertion
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 1. Extract client IP for trusted fingerprinting
    const clientIp = getClientIp(request)
    const headerList = await headers()
    
    // 2. Generate a trusted server-side fingerprint based on IP + User Agent (Daily rotation)
    const userAgent = headerList.get('user-agent') || ''
    const serverFingerprint = await generatePrivacyFingerprint(clientIp, userAgent, 'daily')
    const sanitizedUA = sanitizeUserAgent(userAgent)

    const {
      business_id,
      page_id,
      link_id,
      event_type,
      source,
      metadata
    } = body

    // 3. Basic validation
    if (!event_type) {
      return NextResponse.json(
        { error: 'Tipo de evento não informado.' },
        { status: 400 }
      )
    }

    // 4. Perform insertion using the trusted fingerprint
    // This will trigger the database-level deduplication trigger (tr_enforce_analytics_deduplication)
    // using the SERVER-GENERATED fingerprint.
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        business_id: business_id || null,
        page_id: page_id || null,
        link_id: link_id || null,
        event_type,
        source: source || 'api',
        metadata: metadata || {},
        user_agent: sanitizedUA,
        fingerprint: serverFingerprint, // TRUSTED SIGNAL
      })

    if (error) {
      console.error('[API Analytics] Database error:', error.message)
      // We return success anyway to not leak info or break frontend, 
      // since some events are dropped by deduplication silently.
      return NextResponse.json({ success: true, processed: false })
    }

    return NextResponse.json({ success: true, processed: true })
  } catch (err) {
    console.error('[API Analytics] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar evento.' },
      { status: 500 }
    )
  }
}
