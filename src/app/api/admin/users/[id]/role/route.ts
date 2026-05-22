import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateRoleSchema } from '@/lib/validations/roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Parse and validate body
    const json = await request.json()
    const result = updateRoleSchema.safeParse(json)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: result.error.format() 
      }, { status: 400 })
    }

    const { role } = result.data

    // 3. Update role
    // The database trigger enforce_role_management handles all governance rules:
    // - super_admin can do anything
    // - admin can only manage reviewer <-> customer
    // - prevents self-promotion/demotion for admins
    // - prevents last super_admin removal
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (updateError) {
      // Check if it's a trigger exception (Governance violation)
      // code 'P0001' is for RAISE EXCEPTION in PostgreSQL
      const isGovernanceError = updateError.code === 'P0001'
      
      return NextResponse.json({ 
        error: isGovernanceError ? updateError.message : 'Erro ao atualizar função' 
      }, { status: isGovernanceError ? 403 : 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Role Management API Error]:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
