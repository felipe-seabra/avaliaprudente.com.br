import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API Route to upgrade a 'reviewer' to a 'customer' (SaaS user).
 * This is protected and validates the current user role before upgrading.
 */
export async function POST() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  // 2. Fetch current profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Upgrade API: Failed to fetch profile', profileError)
    return NextResponse.json(
      { error: 'Perfil não encontrado' },
      { status: 404 }
    )
  }

  // 3. Prevent invalid transitions (e.g. downgrading admin)
  if (profile.role !== 'reviewer') {
    // If already customer or admin, just return success (idempotent)
    if (profile.role === 'customer' || profile.role === 'admin' || profile.role === 'super_admin') {
      return NextResponse.json({ success: true, message: 'Usuário já possui acesso empresarial' })
    }
    
    return NextResponse.json(
      { error: 'Transição de papel inválida' },
      { status: 400 }
    )
  }

  // 4. Perform the upgrade
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      role: 'customer',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Upgrade API: Failed to update role', updateError)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }

  console.log(`Upgrade API: User ${user.id} upgraded from reviewer to customer`)

  return NextResponse.json({ 
    success: true, 
    message: 'Conta atualizada para Empresarial com sucesso' 
  })
}
