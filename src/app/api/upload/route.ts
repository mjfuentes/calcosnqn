import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import { STICKER_IMAGE_BUCKET, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/shared/lib/constants'
import type { ApiResponse } from '@/shared/lib/types'

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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const modelNumber = formData.get('model_number') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, and WebP files are allowed' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const folder = modelNumber?.replace('#', '') ?? 'misc'
    const filePath = `${folder}/${Date.now()}.${ext}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from(STICKER_IMAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message } satisfies ApiResponse<never>,
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from(STICKER_IMAGE_BUCKET)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      data: {
        image_url: urlData.publicUrl,
        image_path: filePath,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
