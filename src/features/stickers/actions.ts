'use server'

import { createServerSupabase } from '@/shared/lib/supabase/server'
import { z } from 'zod/v4'
import { createStickerSchema, updateStickerSchema, createTagSchema, updateTagSchema } from './schemas'
import { revalidatePath } from 'next/cache'
import type { ApiResponse } from '@/shared/lib/types'
import type { Sticker, Tag } from './types'

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0]
  return first?.message ?? 'Validation failed'
}

async function requireAdmin() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  return user
}

export async function createSticker(
  formData: unknown
): Promise<ApiResponse<Sticker>> {
  try {
    await requireAdmin()
    const parsed = createStickerSchema.parse(formData)
    const { tag_ids, ...stickerData } = parsed

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('stickers')
      .insert(stickerData)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (tag_ids && tag_ids.length > 0) {
      const tagInserts = tag_ids.map((tag_id) => ({
        sticker_id: data.id,
        tag_id,
      }))
      await supabase.from('sticker_tags').insert(tagInserts)
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/stickers')

    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) }
    }
    const message = error instanceof Error ? error.message : 'Failed to create sticker'
    return { success: false, error: message }
  }
}

export async function updateSticker(
  formData: unknown
): Promise<ApiResponse<Sticker>> {
  try {
    await requireAdmin()
    const parsed = updateStickerSchema.parse(formData)
    const { id, tag_ids, ...updateData } = parsed

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('stickers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (tag_ids !== undefined) {
      await supabase.from('sticker_tags').delete().eq('sticker_id', id)

      if (tag_ids.length > 0) {
        const tagInserts = tag_ids.map((tag_id) => ({
          sticker_id: id,
          tag_id,
        }))
        await supabase.from('sticker_tags').insert(tagInserts)
      }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/stickers')

    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) }
    }
    const message = error instanceof Error ? error.message : 'Failed to update sticker'
    return { success: false, error: message }
  }
}

export async function deleteSticker(
  id: string
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    const { data: sticker } = await supabase
      .from('stickers')
      .select('image_path')
      .eq('id', id)
      .single()

    if (sticker?.image_path) {
      await supabase.storage
        .from('sticker-images')
        .remove([sticker.image_path])
    }

    const { error } = await supabase
      .from('stickers')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/stickers')

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete sticker'
    return { success: false, error: message }
  }
}

export async function updateStock(
  updates: Array<{ id: string; stock: number }>
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    for (const { id, stock } of updates) {
      const { error } = await supabase
        .from('stickers')
        .update({ stock })
        .eq('id', id)

      if (error) {
        return { success: false, error: `Failed to update stock for ${id}: ${error.message}` }
      }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/stock')

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update stock'
    return { success: false, error: message }
  }
}

export async function createTag(
  formData: unknown
): Promise<ApiResponse<Tag>> {
  try {
    await requireAdmin()
    const parsed = createTagSchema.parse(formData)

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('tags')
      .insert(parsed)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/tags')

    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) }
    }
    const message = error instanceof Error ? error.message : 'Failed to create tag'
    return { success: false, error: message }
  }
}

export async function updateTag(
  formData: unknown
): Promise<ApiResponse<Tag>> {
  try {
    await requireAdmin()
    const parsed = updateTagSchema.parse(formData)
    const { id, ...updateData } = parsed

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/tags')

    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) }
    }
    const message = error instanceof Error ? error.message : 'Failed to update tag'
    return { success: false, error: message }
  }
}

export async function deleteTag(
  id: string
): Promise<ApiResponse<null>> {
  try {
    await requireAdmin()
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/[locale]/catalogo')
    revalidatePath('/[locale]/admin/tags')

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete tag'
    return { success: false, error: message }
  }
}
