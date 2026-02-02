import { createServerSupabase } from '@/shared/lib/supabase/server'
import type { StickerWithTags, Tag, Sticker } from './types'
import type { CatalogFilter } from './schemas'
import { ITEMS_PER_PAGE } from '@/shared/lib/constants'

export async function getStickers(
  filters: CatalogFilter = {}
): Promise<{ stickers: StickerWithTags[]; total: number }> {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))', { count: 'exact' })
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
    throw new Error(`Failed to fetch stickers: ${error.message}`)
  }

  const stickers: StickerWithTags[] = (data ?? []).map((row) => {
    const stickerTags = (row as Record<string, unknown>).sticker_tags as
      | Array<{ tags: Tag }>
      | undefined
    const tags = stickerTags?.map((st) => st.tags).filter(Boolean) ?? []
    const { sticker_tags: _, ...sticker } = row as Record<string, unknown> & {
      sticker_tags: unknown
    }
    return { ...(sticker as unknown as Sticker), tags }
  })

  return { stickers, total: count ?? 0 }
}

export async function getStickerBySlug(
  slug: string
): Promise<StickerWithTags | null> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .eq('slug', slug)
    .eq('status', 'active')
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

export async function getFeaturedStickers(): Promise<StickerWithTags[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(8)

  if (error) {
    throw new Error(`Failed to fetch featured stickers: ${error.message}`)
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

export async function getRelatedStickers(
  stickerId: string,
  tagIds: string[],
  limit = 4
): Promise<StickerWithTags[]> {
  const supabase = await createServerSupabase()

  if (tagIds.length === 0) {
    const { data, error } = await supabase
      .from('stickers')
      .select('*, sticker_tags(tag_id, tags(*))')
      .eq('status', 'active')
      .neq('id', stickerId)
      .limit(limit)

    if (error) return []

    return (data ?? []).map((row) => {
      const stickerTags = (row as Record<string, unknown>).sticker_tags as
        | Array<{ tags: Tag }>
        | undefined
      const tags = stickerTags?.map((st) => st.tags).filter(Boolean) ?? []
      const { sticker_tags: _, ...sticker } = row as Record<
        string,
        unknown
      > & { sticker_tags: unknown }
      return { ...(sticker as unknown as Sticker), tags }
    })
  }

  const { data: relatedIds } = await supabase
    .from('sticker_tags')
    .select('sticker_id')
    .in('tag_id', tagIds)
    .neq('sticker_id', stickerId)

  const uniqueIds = [
    ...new Set((relatedIds ?? []).map((r) => r.sticker_id)),
  ].slice(0, limit)

  if (uniqueIds.length === 0) return []

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .in('id', uniqueIds)
    .eq('status', 'active')

  if (error) return []

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

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name_es', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`)
  }

  return data ?? []
}

export async function getStickersByTag(
  tagSlug: string
): Promise<StickerWithTags[]> {
  const supabase = await createServerSupabase()

  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .single()

  if (!tag) return []

  const { data: stickerIds } = await supabase
    .from('sticker_tags')
    .select('sticker_id')
    .eq('tag_id', tag.id)

  if (!stickerIds || stickerIds.length === 0) return []

  const { data, error } = await supabase
    .from('stickers')
    .select('*, sticker_tags(tag_id, tags(*))')
    .in(
      'id',
      stickerIds.map((s) => s.sticker_id)
    )
    .eq('status', 'active')

  if (error) return []

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
