import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { logger } from './logger'

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

  // 2. Structured JSON Logging (Operational Observability)
  const isSecurityAction = payload.action.toLowerCase().includes('security') || 
                           payload.action.toLowerCase().includes('delete') ||
                           payload.action.toLowerCase().includes('update_role')
  
  const logMethod = isSecurityAction ? logger.security.bind(logger) : logger.info.bind(logger)
  
  await logMethod(`Audit Event: ${payload.action}`, {
    actorId,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    ...payload.metadata,
  })

  try {
    // 3. Initialize Service Role client for DB logging
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

    // 4. Insert the log
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
      await logger.error('[Audit Logger] Failed to insert audit log into DB', error)
    }
  } catch (err) {
    await logger.error('[Audit Logger] Unexpected error during database audit logging', err)
  }
}
