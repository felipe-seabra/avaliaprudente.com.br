import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from './logger'

interface AuditLogPayload {
  action: string
  resourceType: string
  resourceId?: string
  actorId?: string // Now explicit
  metadata?: Record<string, unknown>
}

/**
 * Server-side utility for creating tamper-resistant audit logs.
 * Safe for use in Middleware, Server Actions, and API Routes.
 * Uses the Service Role to guarantee insertion regardless of user RLS.
 */
export async function logAuditEvent(payload: AuditLogPayload) {
  const { action, resourceType, resourceId, actorId, metadata } = payload

  // 1. Structured JSON Logging (Operational Observability)
  const actionLower = action.toLowerCase()
  const isSecurityAction = actionLower.includes('security') || 
                           actionLower.includes('delete') ||
                           actionLower.includes('update_role') ||
                           actionLower.includes('violation')
  
  const logMethod = isSecurityAction ? logger.security.bind(logger) : logger.info.bind(logger)
  
  await logMethod(`Audit Event: ${action}`, {
    actorId,
    resourceType,
    resourceId,
    ...metadata,
  })

  try {
    // 2. Initialize Service Role client for DB logging
    const adminClient = createAdminClient()

    // 3. Insert the log
    const { error } = await adminClient
      .from('audit_logs')
      .insert({
        actor_id: actorId || null,
        action: action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        metadata: metadata || {},
      })

    if (error) {
      await logger.error('[Audit Logger] Failed to insert audit log into DB', error)
    }
  } catch (err) {
    await logger.error('[Audit Logger] Unexpected error during database audit logging', err)
  }
}
