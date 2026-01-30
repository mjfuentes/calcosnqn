import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

interface MockQueryResult {
  data: unknown
  error: unknown
  count?: number
}

function createMockQueryBuilder(result: MockQueryResult) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}

  const chainable = (method: string) => {
    builder[method] = vi.fn().mockReturnValue(builder)
    return builder
  }

  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'or',
    'in',
    'order',
    'range',
    'limit',
    'single',
  ] as const

  for (const method of methods) {
    chainable(method)
  }

  // The terminal methods return the result as a thenable
  const terminalResult = Promise.resolve(result)
  const originalSelect = builder.select

  // Make the builder itself thenable so `await query` resolves
  builder.then = vi.fn(
    (onFulfilled?: (v: MockQueryResult) => unknown) =>
      terminalResult.then(onFulfilled)
  )

  // Restore select to still be chainable but keep thenable
  builder.select = originalSelect

  return builder
}

function createMockSupabaseClient(
  tableResults: Record<string, MockQueryResult> = {}
) {
  const builders: Record<string, ReturnType<typeof createMockQueryBuilder>> = {}

  const fromFn = vi.fn((table: string) => {
    if (!builders[table]) {
      const result = tableResults[table] ?? {
        data: [],
        error: null,
        count: 0,
      }
      builders[table] = createMockQueryBuilder(result)
    }
    return builders[table]
  })

  return {
    from: fromFn,
    builders,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_TAG = Object.freeze({
  id: 'tag-1',
  name_es: 'Anime',
  name_en: 'Anime',
  slug: 'anime',
  created_at: '2024-01-01T00:00:00Z',
})

const MOCK_TAG_2 = Object.freeze({
  id: 'tag-2',
  name_es: 'Naturaleza',
  name_en: 'Nature',
  slug: 'nature',
  created_at: '2024-01-02T00:00:00Z',
})

const MOCK_STICKER_ROW = Object.freeze({
  id: 'sticker-1',
  model_number: '#001',
  name_es: 'Luna',
  name_en: 'Moon',
  description_es: 'Calco de luna',
  description_en: 'Moon sticker',
  slug: 'luna',
  base_type: 'base_blanca',
  price_ars: 1500,
  stock: 10,
  image_url: null,
  image_path: null,
  status: 'active',
  is_featured: true,
  sort_order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  sticker_tags: [{ tag_id: 'tag-1', tags: { ...MOCK_TAG } }],
})

const MOCK_STICKER_ROW_2 = Object.freeze({
  id: 'sticker-2',
  model_number: '#002',
  name_es: 'Sol',
  name_en: 'Sun',
  description_es: 'Calco de sol',
  description_en: 'Sun sticker',
  slug: 'sol',
  base_type: 'base_holografica',
  price_ars: 2000,
  stock: 5,
  image_url: null,
  image_path: null,
  status: 'active',
  is_featured: false,
  sort_order: 2,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  sticker_tags: [{ tag_id: 'tag-2', tags: { ...MOCK_TAG_2 } }],
})

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockClient: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/shared/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => Promise.resolve(mockClient)),
}))

// ---------------------------------------------------------------------------
// Import module under test AFTER mocks are declared
// ---------------------------------------------------------------------------

const {
  getStickers,
  getStickerBySlug,
  getFeaturedStickers,
  getRelatedStickers,
  getAllTags,
  getStickersByTag,
} = await import('@/features/stickers/queries')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('queries integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // getStickers
  // -----------------------------------------------------------------------

  describe('getStickers', () => {
    it('returns stickers with tags and total count', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }, { ...MOCK_STICKER_ROW_2 }],
          error: null,
          count: 2,
        },
      })

      const result = await getStickers()

      expect(result.stickers).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.stickers[0]).toMatchObject({
        id: 'sticker-1',
        name_es: 'Luna',
        tags: [expect.objectContaining({ id: 'tag-1', slug: 'anime' })],
      })
      // Verify sticker_tags is stripped from the returned object
      expect(result.stickers[0]).not.toHaveProperty('sticker_tags')
    })

    it('applies search filter via or clause', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }],
          error: null,
          count: 1,
        },
      })

      const result = await getStickers({ search: 'luna' })

      expect(result.stickers).toHaveLength(1)
      expect(result.stickers[0].name_es).toBe('Luna')
      expect(mockClient.builders['stickers'].or).toHaveBeenCalled()
    })

    it('applies price ascending sort', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }, { ...MOCK_STICKER_ROW_2 }],
          error: null,
          count: 2,
        },
      })

      const result = await getStickers({ sort: 'price_asc' })

      expect(result.stickers).toHaveLength(2)
      expect(mockClient.builders['stickers'].order).toHaveBeenCalled()
    })

    it('applies base_type filter', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }],
          error: null,
          count: 1,
        },
      })

      const result = await getStickers({ base_type: 'base_blanca' })

      expect(result.stickers).toHaveLength(1)
      expect(result.stickers[0].base_type).toBe('base_blanca')
    })

    it('applies price descending sort', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW_2 }, { ...MOCK_STICKER_ROW }],
          error: null,
          count: 2,
        },
      })

      const result = await getStickers({ sort: 'price_desc' })

      expect(result.stickers).toHaveLength(2)
      expect(mockClient.builders['stickers'].order).toHaveBeenCalled()
    })

    it('applies name ascending sort', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }, { ...MOCK_STICKER_ROW_2 }],
          error: null,
          count: 2,
        },
      })

      const result = await getStickers({ sort: 'name_asc' })

      expect(result.stickers).toHaveLength(2)
      expect(mockClient.builders['stickers'].order).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Database error' },
          count: null,
        },
      })

      await expect(getStickers()).rejects.toThrow(
        'Failed to fetch stickers: Database error'
      )
    })

    it('returns empty array and zero total when data is null', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: null,
          count: null,
        },
      })

      // data is null but error is also null -- falls through to mapping
      // null data maps to empty array, null count to 0
      const result = await getStickers()

      expect(result.stickers).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  // -----------------------------------------------------------------------
  // getStickerBySlug
  // -----------------------------------------------------------------------

  describe('getStickerBySlug', () => {
    it('returns sticker with tags when found', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { ...MOCK_STICKER_ROW },
          error: null,
        },
      })

      const result = await getStickerBySlug('luna')

      expect(result).not.toBeNull()
      expect(result!.id).toBe('sticker-1')
      expect(result!.slug).toBe('luna')
      expect(result!.tags).toHaveLength(1)
      expect(result!.tags[0].slug).toBe('anime')
      // sticker_tags should be stripped
      expect(result).not.toHaveProperty('sticker_tags')
    })

    it('returns null when sticker not found (PGRST116)', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        },
      })

      const result = await getStickerBySlug('nonexistent')

      expect(result).toBeNull()
    })

    it('throws on non-PGRST116 errors', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { code: '42P01', message: 'Relation does not exist' },
        },
      })

      await expect(getStickerBySlug('bad')).rejects.toThrow(
        'Failed to fetch sticker: Relation does not exist'
      )
    })
  })

  // -----------------------------------------------------------------------
  // getFeaturedStickers
  // -----------------------------------------------------------------------

  describe('getFeaturedStickers', () => {
    it('returns only featured stickers', async () => {
      const featuredRow = {
        ...MOCK_STICKER_ROW,
        is_featured: true,
      }
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [featuredRow],
          error: null,
        },
      })

      const result = await getFeaturedStickers()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sticker-1')
      expect(result[0].tags).toHaveLength(1)
      expect(result[0]).not.toHaveProperty('sticker_tags')

      expect(mockClient.builders['stickers'].eq).toHaveBeenCalled()
      expect(mockClient.builders['stickers'].limit).toHaveBeenCalled()
    })

    it('throws on supabase error', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Connection lost' },
        },
      })

      await expect(getFeaturedStickers()).rejects.toThrow(
        'Failed to fetch featured stickers: Connection lost'
      )
    })
  })

  // -----------------------------------------------------------------------
  // getAllTags
  // -----------------------------------------------------------------------

  describe('getAllTags', () => {
    it('returns sorted tags', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: [{ ...MOCK_TAG }, { ...MOCK_TAG_2 }],
          error: null,
        },
      })

      const result = await getAllTags()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ id: 'tag-1', slug: 'anime' })
      expect(result[1]).toMatchObject({ id: 'tag-2', slug: 'nature' })
    })

    it('returns empty array when data is null and no error', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: null,
        },
      })

      const result = await getAllTags()

      expect(result).toEqual([])
    })

    it('throws on supabase error', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: { message: 'Permission denied' },
        },
      })

      await expect(getAllTags()).rejects.toThrow(
        'Failed to fetch tags: Permission denied'
      )
    })
  })

  // -----------------------------------------------------------------------
  // getRelatedStickers
  // -----------------------------------------------------------------------

  describe('getRelatedStickers', () => {
    it('returns related stickers by shared tags', async () => {
      // Two different `from` calls happen: sticker_tags then stickers
      // We need the mock to return different results per table
      const stickersResult: MockQueryResult = {
        data: [{ ...MOCK_STICKER_ROW_2 }],
        error: null,
      }
      const stickerTagsResult: MockQueryResult = {
        data: [{ sticker_id: 'sticker-2' }],
        error: null,
      }

      mockClient = createMockSupabaseClient({
        sticker_tags: stickerTagsResult,
        stickers: stickersResult,
      })

      const result = await getRelatedStickers('sticker-1', ['tag-1'])

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sticker-2')
      expect(result[0]).not.toHaveProperty('sticker_tags')
    })

    it('falls back to random stickers when tagIds is empty', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: [{ ...MOCK_STICKER_ROW_2 }],
          error: null,
        },
      })

      const result = await getRelatedStickers('sticker-1', [])

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sticker-2')
    })

    it('returns empty array when no related sticker ids found', async () => {
      mockClient = createMockSupabaseClient({
        sticker_tags: {
          data: [],
          error: null,
        },
        stickers: {
          data: [],
          error: null,
        },
      })

      const result = await getRelatedStickers('sticker-1', ['tag-99'])

      expect(result).toEqual([])
    })

    it('returns empty array on stickers query error with empty tags', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Some error' },
        },
      })

      const result = await getRelatedStickers('sticker-1', [])

      expect(result).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // getStickersByTag
  // -----------------------------------------------------------------------

  describe('getStickersByTag', () => {
    it('returns stickers matching a tag slug', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: { id: 'tag-1' },
          error: null,
        },
        sticker_tags: {
          data: [{ sticker_id: 'sticker-1' }],
          error: null,
        },
        stickers: {
          data: [{ ...MOCK_STICKER_ROW }],
          error: null,
        },
      })

      const result = await getStickersByTag('anime')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('sticker-1')
      expect(result[0]).not.toHaveProperty('sticker_tags')
      expect(result[0].tags).toHaveLength(1)
    })

    it('returns empty array when tag not found', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: null,
        },
      })

      const result = await getStickersByTag('nonexistent')

      expect(result).toEqual([])
    })

    it('returns empty array when no sticker ids for tag', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: { id: 'tag-1' },
          error: null,
        },
        sticker_tags: {
          data: [],
          error: null,
        },
      })

      const result = await getStickersByTag('anime')

      expect(result).toEqual([])
    })

    it('returns empty array on stickers query error', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: { id: 'tag-1' },
          error: null,
        },
        sticker_tags: {
          data: [{ sticker_id: 'sticker-1' }],
          error: null,
        },
        stickers: {
          data: null,
          error: { message: 'Query failed' },
        },
      })

      const result = await getStickersByTag('anime')

      expect(result).toEqual([])
    })

    it('returns empty array when stickerIds is null', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: { id: 'tag-1' },
          error: null,
        },
        sticker_tags: {
          data: null,
          error: null,
        },
      })

      const result = await getStickersByTag('anime')

      expect(result).toEqual([])
    })
  })
})
