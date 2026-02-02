import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import { createStickerSchema, catalogFilterSchema } from '@/features/stickers/schemas'
import type { ApiResponse } from '@/shared/lib/types'
import { ITEMS_PER_PAGE } from '@/shared/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = catalogFilterSchema.parse({
      search: searchParams.get('search') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
      product_type: searchParams.get('product_type') ?? undefined,
      base_type: searchParams.get('base_type') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      page: searchParams.get('page') ?? undefined,
    })

    const supabase = await createServerSupabase()

    let query = supabase
      .from('stickers')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (filters.product_type) {
      query = query.eq('product_type', filters.product_type)
    }

    if (filters.search) {
      query = query.or(
        `name_es.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,model_number.ilike.%${filters.search}%`
      )
    }

    if (filters.base_type) {
      query = query.eq('base_type', filters.base_type)
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price_ars', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_ars', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name_es', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const page = filters.page ?? 1
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { total: count ?? 0, page, limit: ITEMS_PER_PAGE },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stickers'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = createStickerSchema.parse(body)
    const { tag_ids, ...stickerData } = parsed

    const { data, error } = await supabase
      .from('stickers')
      .insert(stickerData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    if (tag_ids && tag_ids.length > 0) {
      await supabase.from('sticker_tags').insert(
        tag_ids.map((tag_id) => ({ sticker_id: data.id, tag_id }))
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sticker'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 400 }
    )
  }
}
