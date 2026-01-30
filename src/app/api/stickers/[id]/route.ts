import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import type { ApiResponse } from '@/shared/lib/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('stickers')
      .select('*, sticker_tags(tag_id, tags(*))')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sticker'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tag_ids, ...updateData } = body

    const { data, error } = await supabase
      .from('stickers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    if (tag_ids !== undefined) {
      await supabase.from('sticker_tags').delete().eq('sticker_id', id)
      if (tag_ids.length > 0) {
        await supabase.from('sticker_tags').insert(
          tag_ids.map((tag_id: string) => ({ sticker_id: id, tag_id }))
        )
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update sticker'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 400 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const { data: sticker } = await supabase
      .from('stickers')
      .select('image_path')
      .eq('id', id)
      .single()

    if (sticker?.image_path) {
      await supabase.storage.from('sticker-images').remove([sticker.image_path])
    }

    const { error } = await supabase
      .from('stickers')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete sticker'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
