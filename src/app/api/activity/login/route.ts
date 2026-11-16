import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit-logger'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await logAuditEvent({
      action: 'AUTH_LOGIN',
      resourceType: 'auth',
      resourceId: user.id,
      actorId: user.id,
      metadata: {
        provider: user.app_metadata?.provider || 'unknown',
        method: 'password',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Auth Activity] Failed to record login:', error)
    return NextResponse.json({ error: 'Não foi possível registrar a atividade' }, { status: 500 })
  }
}
