import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import { createTagSchema } from '@/features/stickers/schemas'
import type { ApiResponse } from '@/shared/lib/types'

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name_es', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tags'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 }
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
    const parsed = createTagSchema.parse(body)

    const { data, error } = await supabase
      .from('tags')
      .insert(parsed)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create tag'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 400 }
    )
  }
}
