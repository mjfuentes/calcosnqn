import { createServerSupabase } from '@/shared/lib/supabase/server'
import type { Sticker, StickerWithTags, Tag } from './types'

export async function getAdminStickers(): Promise<StickerWithTags[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch stickers: ${error.message}`)
  }

  return (data ?? []).map((row) => {
    const stickerTags = (row as Record<string, unknown>).sticker_tags as
      | Array<{ tags: Tag }>
      | undefined
    const tags = stickerTags?.map((st) => st.tags).filter(Boolean) ?? []
    const { sticker_tags: _, ...sticker } = row as Record<string, unknown> & {
      sticker_tags: unknown
    }
    return { ...(sticker as unknown as Sticker), tags }
  })
}

export async function getAdminStickerById(
  id: string
): Promise<StickerWithTags | null> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch sticker: ${error.message}`)
  }

  const stickerTags = (data as Record<string, unknown>).sticker_tags as
    | Array<{ tags: Tag }>
    | undefined
  const tags = stickerTags?.map((st) => st.tags).filter(Boolean) ?? []
  const { sticker_tags: _, ...sticker } = data as Record<string, unknown> & {
    sticker_tags: unknown
  }
  return { ...(sticker as unknown as Sticker), tags }
}

export async function getDashboardStats() {
  const supabase = await createServerSupabase()

  const { count: total } = await supabase
    .from('stickers')
    .select('*', { count: 'exact', head: true })

  const { count: active } = await supabase
    .from('stickers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: draft } = await supabase
    .from('stickers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  const { data: lowStock } = await supabase
    .from('stickers')
    .select('id')
    .lt('stock', 5)
    .eq('status', 'active')

  return {
    total: total ?? 0,
    active: active ?? 0,
    draft: draft ?? 0,
    lowStock: lowStock?.length ?? 0,
  }
}
