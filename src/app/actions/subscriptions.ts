'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit-logger'
import { revalidatePath } from 'next/cache'
import { SubscriptionStatus } from '@/lib/subscription-config'

/**
 * Assign or update a user's subscription.
 * ONLY for super_admins.
 */
export async function adminAssignSubscription(
  userId: string,
  planId: string,
  status: SubscriptionStatus,
  reason: string
) {
  const supabase = await createClient()

  // 1. Verify if actor is super_admin
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (!actor) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', actor.id)
    .single()

  if (profile?.role !== 'super_admin') {
    throw new Error('Apenas Super Administradores podem gerenciar assinaturas.')
  }

  // 2. Fetch current subscription for audit log
  const { data: currentSubscription } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .single()

  // 3. Update subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      status: status,
      assigned_by: actor.id,
      assigned_reason: reason,
      source: 'admin',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('[Admin Subscription] Error updating subscription:', error)
    return { error: 'Falha ao atualizar assinatura.' }
  }

  // 4. Audit Log
  await logAuditEvent({
    action: 'ADMIN_ASSIGN_SUBSCRIPTION',
    resourceType: 'user_subscription',
    resourceId: userId,
    actorId: actor.id,
    metadata: {
      planId,
      status,
      reason,
      previousPlanId: currentSubscription?.plan_id,
      previousStatus: currentSubscription?.status,
    },
  })

  // 5. Subscription specific audit log (as requested in architecture)
  await supabase.from('subscription_audit_logs').insert({
    user_id: userId,
    actor_id: actor.id,
    action: 'plan_assigned',
    previous_plan_id: currentSubscription?.plan_id,
    new_plan_id: planId,
    metadata: { status, reason },
  })

  revalidatePath('/admin/subscriptions')
  revalidatePath('/dashboard')
  
  return { success: true }
}

/**
 * Fetch all available plans for the admin UI.
 */
export async function getSubscriptionPlans() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return data
}
