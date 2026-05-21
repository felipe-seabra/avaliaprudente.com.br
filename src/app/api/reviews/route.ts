import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { z } from 'zod'

const ReviewSubmissionSchema = z.object({
  business_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().max(2000).optional().nullable(),
  display_name: z.string().trim().min(1).max(80),
  is_internal: z.boolean().optional(),
  source: z.string().trim().max(50).optional(),
  browser_fingerprint: z.string().trim().max(128).optional().nullable(),
})

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

function getAuthProvider(user: { app_metadata?: Record<string, unknown>, identities?: { provider?: string }[] }) {
  const provider = user.app_metadata?.provider || user.identities?.[0]?.provider

  if (provider === 'google') return 'google'
  if (provider === 'email') return 'email'

  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const authSupabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Faça login para enviar sua avaliação.' },
        { status: 401 }
      )
    }

    const body = ReviewSubmissionSchema.safeParse(await request.json())

    if (!body.success) {
      return NextResponse.json(
        { error: 'Dados de avaliação inválidos.' },
        { status: 400 }
      )
    }

    const {
      business_id,
      rating,
      feedback,
      display_name,
      is_internal,
      source,
      browser_fingerprint,
    } = body.data

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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_blocked, is_deleted, account_status, suspended_until')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[API Review] Profile lookup failed:', profileError?.message)
      return NextResponse.json(
        { error: 'Não foi possível validar sua conta para enviar a avaliação.' },
        { status: 403 }
      )
    }

    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'
    const isSuspended = profile.account_status === 'suspended' && (!profile.suspended_until || new Date(profile.suspended_until) > new Date())
    const isBlocked = profile.is_blocked || profile.is_deleted || profile.account_status === 'banned' || isSuspended

    if (!isAdmin && isBlocked) {
      return NextResponse.json(
        { error: 'Sua conta não pode enviar avaliações no momento.' },
        { status: 403 }
      )
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, is_frozen')
      .eq('id', business_id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Empresa não encontrada.' },
        { status: 404 }
      )
    }

    if (!isAdmin && business.is_frozen) {
      return NextResponse.json(
        { error: 'Esta empresa está temporariamente indisponível para novas avaliações.' },
        { status: 403 }
      )
    }

    const authProvider = getAuthProvider(user)

    // 4. Perform insertion using authenticated identity and trusted fingerprint
    // This will trigger the database-level anti-spam protection (tr_enforce_review_abuse_protection)
    // using the SERVER-GENERATED fingerprint that the client cannot spoof easily.
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        business_id,
        rating,
        feedback: feedback?.trim() || null,
        display_name,
        user_id: user.id,
        auth_provider: authProvider,
        customer_name: null,
        customer_email: null,
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
