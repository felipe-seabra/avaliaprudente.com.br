import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import { createClient as createServerClient } from '@/lib/supabase/server'

interface AuditLogPayload {
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

/**
 * Server-side utility for creating tamper-resistant audit logs.
 * Uses the Service Role to guarantee insertion regardless of user RLS,
 * but extracts the actor_id from the current Next.js request context if possible.
 */
export async function logAuditEvent(payload: AuditLogPayload) {
  try {
    // 1. Determine the actor (current user) if available
    let actorId: string | undefined
    try {
      const serverClient = await createServerClient()
      const { data: { user } } = await serverClient.auth.getUser()
      if (user) {
        actorId = user.id
      }
    } catch {
      // Ignore errors (e.g. if called outside request context)
    }

    // 2. Initialize Service Role client to bypass RLS for secure logging
    const adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )

    // 3. Insert the log
    const { error } = await adminClient
      .from('audit_logs')
      .insert({
        actor_id: actorId || null,
        action: payload.action,
        resource_type: payload.resourceType,
        resource_id: payload.resourceId || null,
        metadata: payload.metadata || {},
      })

    if (error) {
      console.error('[Audit Logger] Failed to insert audit log:', error)
    }
  } catch (err) {
    console.error('[Audit Logger] Unexpected error during audit logging:', err)
  }
}
