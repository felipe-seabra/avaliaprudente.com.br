import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ResponseSchema = z.object({
  content: z.string().trim().min(1, 'A resposta não pode estar vazia.').max(4000, 'A resposta é muito longa.'),
})

/**
 * POST /api/reviews/[id]/response
 * Creates an official response to a review.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const supabase = await createServerClient()
    
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // 2. Validate body
    const json = await request.json()
    const body = ResponseSchema.safeParse(json)
    if (!body.success) {
      return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })
    }

    // 3. Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
    }

    // 4. Get the review to find the associated business
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 })
    }

    // 5. Insert response (RLS will handle ownership check for customers)
    const { data, error } = await supabase
      .from('review_responses')
      .insert({
        review_id: reviewId,
        business_id: review.business_id,
        author_id: user.id,
        author_role: profile.role,
        content: body.data.content,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Review Response POST] Error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Esta avaliação já possui uma resposta oficial.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Erro ao salvar resposta oficial.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Review Response POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

/**
 * PATCH /api/reviews/[id]/response
 * Updates an existing response.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const json = await request.json()
    const body = ResponseSchema.safeParse(json)
    if (!body.success) {
      return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('review_responses')
      .update({
        content: body.data.content,
        deleted_at: null, // Ensure it's not soft-deleted if updated
      })
      .eq('review_id', reviewId)
      .select()
      .single()

    if (error) {
      console.error('[API Review Response PATCH] Error:', error)
      return NextResponse.json({ error: 'Não foi possível atualizar a resposta.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Review Response PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

/**
 * DELETE /api/reviews/[id]/response
 * Soft deletes a response.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // Soft delete
    const { error } = await supabase
      .from('review_responses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('review_id', reviewId)

    if (error) {
      console.error('[API Review Response DELETE] Error:', error)
      return NextResponse.json({ error: 'Não foi possível remover a resposta.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API Review Response DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
