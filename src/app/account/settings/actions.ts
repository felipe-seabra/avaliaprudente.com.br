'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAuditEvent } from '@/lib/audit-logger'

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
})

const notificationSchema = z.object({
  email_official_responses: z.boolean(),
  email_platform_updates: z.boolean(),
})

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Runtime validation
  const validated = profileSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: validated.data.fullName,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile error:', error)
    return { error: 'Erro ao atualizar perfil' }
  }

  // Also update Auth metadata to keep UserMenu and other components in sync
  await supabase.auth.updateUser({
    data: { full_name: validated.data.fullName }
  })

  await logAuditEvent({
    action: 'profile_update',
    resourceType: 'profiles',
    resourceId: user.id,
  })

  revalidatePath('/account/settings')
  return { success: true }
}

export async function updateNotificationPreferences(prefs: z.infer<typeof notificationSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Runtime validation
  const validated = notificationSchema.safeParse(prefs)
  if (!validated.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      notification_preferences: validated.data,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateNotificationPreferences error:', error)
    return { error: 'Erro ao atualizar preferências' }
  }

  await logAuditEvent({
    action: 'notification_preferences_update',
    resourceType: 'profiles',
    resourceId: user.id,
  })

  revalidatePath('/account/settings')
  return { success: true }
}

export async function deactivateAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Soft delete via is_deleted = true. 
  // The trigger 'protect_profile_fields' will handle setting deleted_at.
  const { error } = await supabase
    .from('profiles')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('deactivateAccount error:', error)
    return { error: 'Erro ao desativar conta' }
  }

  await logAuditEvent({
    action: 'account_deactivation',
    resourceType: 'profiles',
    resourceId: user.id,
  })

  await supabase.auth.signOut()
  
  revalidatePath('/')
  return { success: true }
}
