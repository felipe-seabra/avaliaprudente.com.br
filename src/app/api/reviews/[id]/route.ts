import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().max(2000).optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = UpdateReviewSchema.safeParse(await request.json())

    if (!body.success) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const { rating, feedback } = body.data

    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        feedback: feedback || null,
        // updated_at is handled by the database trigger
      })
      .eq('id', id)
      .select('updated_at')
      .single()

    if (error) {
      console.error('[API Review PATCH] Error:', error.message)
      return NextResponse.json({ error: 'Não foi possível atualizar a avaliação.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Review PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API Review DELETE] Error:', error.message)
      return NextResponse.json({ error: 'Não foi possível excluir a avaliação.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API Review DELETE] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
