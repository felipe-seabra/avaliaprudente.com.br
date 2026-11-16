import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ReviewActivity = {
  id: string
  rating: number
  feedback: string | null
  display_name: string | null
  source: string
  created_at: string
  business: { name: string; slug: string } | null
}

type AuditActivity = {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  created_at: string
}

type ModerationActivity = {
  id: string
  action_type: string
  reason: string | null
  created_at: string
  admin_user_id: string | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !['admin', 'super_admin'].includes(adminProfile?.role || '')) {
      return NextResponse.json({ error: 'Acesso restrito à administração' }, { status: 403 })
    }

    const admin = createAdminClient()
    const [
      authUserResult,
      profileResult,
      reviewsResult,
      auditResult,
      moderationResult,
    ] = await Promise.all([
      admin.auth.admin.getUserById(id),
      admin.from('profiles')
        .select('id, full_name, email, username, role, created_at, last_login_at, account_status, warning_count, suspended_until, banned_at, is_deleted, terms_accepted_at, terms_version')
        .eq('id', id)
        .maybeSingle(),
      admin.from('reviews')
        .select('id, rating, feedback, display_name, source, created_at, businesses(name, slug)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
      admin.from('audit_logs')
        .select('id, action, resource_type, resource_id, created_at')
        .eq('actor_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
      admin.from('moderation_actions')
        .select('id, action_type, reason, created_at, admin_user_id')
        .eq('target_user_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (profileResult.error) {
      console.error('[Admin User Activity] Profile query failed:', profileResult.error)
      return NextResponse.json({ error: 'Não foi possível carregar o perfil' }, { status: 500 })
    }

    if (!profileResult.data) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (authUserResult.error) {
      console.error('[Admin User Activity] Auth user query failed:', authUserResult.error)
      return NextResponse.json({ error: 'Não foi possível carregar os dados de autenticação' }, { status: 500 })
    }

    const queryErrors = [reviewsResult.error, auditResult.error, moderationResult.error].filter(Boolean)
    if (queryErrors.length) {
      console.error('[Admin User Activity] Activity query failed:', queryErrors)
      return NextResponse.json({ error: 'Não foi possível carregar todo o histórico do usuário' }, { status: 500 })
    }

    const authUser = authUserResult.data.user
    const reviews = (reviewsResult.data || []) as unknown as Array<ReviewActivity>
    const auditEvents = (auditResult.data || []) as unknown as Array<AuditActivity>
    const moderationEvents = (moderationResult.data || []) as unknown as Array<ModerationActivity>

    return NextResponse.json({
      profile: profileResult.data,
      authentication: {
        email: authUser.email || null,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        provider: authUser.app_metadata?.provider || null,
        providers: authUser.app_metadata?.providers || [],
        email_confirmed_at: authUser.email_confirmed_at || null,
      },
      reviews: reviews.map((review) => ({
        ...review,
        business: Array.isArray(review.business) ? review.business[0] || null : review.business,
      })),
      auditEvents,
      moderationEvents,
      tracking: {
        pageVisits: 'not_collected',
        reviewFlowSteps: 'not_collected',
        historicalLoginEvents: 'not_available',
      },
    })
  } catch (error) {
    console.error('[Admin User Activity] Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno ao consultar atividade do usuário' }, { status: 500 })
  }
}
