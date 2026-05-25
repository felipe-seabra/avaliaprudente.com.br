'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSudo, enableSudoMode } from '@/lib/sudo'

export async function verifyPasswordForSudo(password: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  // Attempt to re-authenticate with the provided password
  // We use signInWithPassword with the user's email.
  // Note: if they don't have an email or password, this will fail.
  if (!user.email) {
    return { error: 'Conta sem e-mail não suportada.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (error) {
    return { error: 'Senha incorreta.' }
  }

  // Set the sudo token
  await enableSudoMode(user.id)
  
  return { success: true }
}

export async function getSudoAuthProvider() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Supabase stores provider in app_metadata or identities
  const provider = user.app_metadata?.provider || user.identities?.[0]?.provider
  return provider as string || 'email'
}

export async function checkSudoStatus() {
  const hasSudo = await checkSudo()
  return { hasSudo }
}
