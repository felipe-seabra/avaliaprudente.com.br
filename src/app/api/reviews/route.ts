import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import crypto from 'crypto'

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
    const headerList = await headers()
    
    // 1. Extract client IP for trusted fingerprinting
    const forwardedFor = headerList.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
    
    // 2. Generate a trusted server-side fingerprint based on IP + User Agent
    const userAgent = headerList.get('user-agent') || ''
    const serverFingerprint = crypto
      .createHash('sha256')
      .update(`${clientIp}-${userAgent}`)
      .digest('hex')

    const {
      business_id,
      rating,
      feedback,
      customer_name,
      customer_email,
      is_internal,
      source,
      browser_fingerprint // Still accepted as metadata/supporting signal
    } = body

    // 3. Basic validation
    if (!business_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Dados de avaliação inválidos.' },
        { status: 400 }
      )
    }

    // 4. Perform insertion using the trusted fingerprint
    // This will trigger the database-level anti-spam protection (tr_enforce_review_abuse_protection)
    // using the SERVER-GENERATED fingerprint that the client cannot spoof easily.
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        business_id,
        rating,
        feedback: feedback?.trim() || null,
        customer_name: customer_name?.trim() || null,
        customer_email: customer_email?.trim() || null,
        is_internal: !!is_internal,
        source: source || 'api',
        submission_fingerprint: serverFingerprint, // TRUSTED SIGNAL
        browser_fingerprint: browser_fingerprint || null // SUPPORTING SIGNAL
      })
      .select()
      .single()

    if (error) {
      console.error('[API Review] Database error:', error.message)
      
      // Handle specific database exceptions from the trigger
      if (error.message.includes('recentemente') || error.code === 'P0001') {
        return NextResponse.json(
          { error: 'Você já enviou uma avaliação recentemente para esta empresa. Tente novamente em alguns minutos.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Não foi possível processar sua avaliação no momento.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Review] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar avaliação.' },
      { status: 500 }
    )
  }
}
