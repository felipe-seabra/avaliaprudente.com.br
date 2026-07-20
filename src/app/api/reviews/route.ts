import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { generatePrivacyFingerprint } from '@/lib/privacy'
import { PublicScopes } from '@/core/infrastructure/repositories/public-scopes'
import { SupabaseClient } from '@supabase/supabase-js'
import { getClientIp } from '@/lib/request-utils'

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
    const clientIp = getClientIp(request)
    
    // 2. Generate a trusted server-side fingerprint based on IP + User Agent (Weekly rotation)
    const userAgent = headerList.get('user-agent') || ''
    const serverFingerprint = await generatePrivacyFingerprint(clientIp, userAgent, 'weekly')

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

    const { data: business, error: businessError } = await PublicScopes.businesses(supabaseAdmin as SupabaseClient)
      .select('id, is_frozen')
      .eq('id', business_id)
      .maybeSingle()

    if (businessError || !business) {
      // If not found in public scope, it might be frozen or non-existent
      const { data: rawBusiness } = await supabaseAdmin
        .from('businesses')
        .select('id, is_frozen')
        .eq('id', business_id)
        .maybeSingle()

      if (!rawBusiness) {
        return NextResponse.json(
          { error: 'Empresa não encontrada.' },
          { status: 404 }
        )
      }

      if (!isAdmin && rawBusiness.is_frozen) {
        return NextResponse.json(
          { error: 'Esta empresa está temporariamente indisponível para novas avaliações.' },
          { status: 403 }
        )
      }
    }

    const authProvider = getAuthProvider(user)

    // 4. Check if the user already has a review for this business
    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('business_id', business_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingReviewError) {
      console.error('[API Review] Existing review check failed:', existingReviewError.message)
      return NextResponse.json(
        { error: 'Não foi possível validar sua avaliação no momento.' },
        { status: 500 }
      )
    }

    let resultData;
    let resultError;

    if (existingReview) {
      // 5. Update existing review
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({
          rating,
          feedback: feedback?.trim() || null,
          display_name,
          auth_provider: authProvider,
          is_internal: !!is_internal,
          source: source || 'api',
          submission_fingerprint: serverFingerprint,
          browser_fingerprint: browser_fingerprint || null
        })
        .eq('id', existingReview.id)
        .select()
        .single()

      resultData = data;
      resultError = error;
    } else {
      // 5. Insert new review
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
        
      resultData = data;
      resultError = error;
    }

    if (resultError) {
      console.error('[API Review] Database error:', resultError.message)
      
      // Handle specific database exceptions from the trigger
      if (resultError.message.includes('recentemente') || resultError.code === 'P0001') {
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

    return NextResponse.json(resultData)
  } catch (err) {
    console.error('[API Review] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar avaliação.' },
      { status: 500 }
    )
  }
}
