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
    builder[method] = vi.fn().mockReturnValue(builder)
  }

  const terminalResult = Promise.resolve(result)

  builder.then = vi.fn(
    (onFulfilled?: (v: MockQueryResult) => unknown) =>
      terminalResult.then(onFulfilled)
  )

  return builder
}

function createMockSupabaseClient(
  tableResults: Record<string, MockQueryResult> = {},
  options: { isAdmin?: boolean } = {}
) {
  const { isAdmin = true } = options

  const fromFn = vi.fn((table: string) => {
    const result = tableResults[table] ?? {
      data: [],
      error: null,
      count: 0,
    }
    return createMockQueryBuilder(result)
  })

  return {
    from: fromFn,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: isAdmin
            ? { id: 'user-1', user_metadata: { role: 'admin' } }
            : null,
        },
      }),
    },
  }
}

function createMockAdminClient() {
  const removeFn = vi.fn().mockResolvedValue({ error: null })
  return {
    storage: {
      from: vi.fn().mockReturnValue({
        remove: removeFn,
      }),
    },
    _removeFn: removeFn,
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_STICKER_INPUT = Object.freeze({
  model_number: '#001',
  name_es: 'Luna',
  name_en: 'Moon',
  slug: 'luna',
  base_type: 'base_blanca' as const,
  price_ars: 1500,
})

const VALID_TAG_INPUT = Object.freeze({
  name_es: 'Anime',
  name_en: 'Anime',
  slug: 'anime',
})

const MOCK_CREATED_STICKER = Object.freeze({
  id: 'sticker-new',
  model_number: '#001',
  name_es: 'Luna',
  name_en: 'Moon',
  description_es: null,
  description_en: null,
  slug: 'luna',
  base_type: 'base_blanca',
  price_ars: 1500,
  stock: 0,
  image_url: null,
  image_path: null,
  status: 'draft',
  is_featured: false,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
})

const MOCK_CREATED_TAG = Object.freeze({
  id: 'tag-new',
  name_es: 'Anime',
  name_en: 'Anime',
  slug: 'anime',
  created_at: '2024-01-01T00:00:00Z',
})

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockClient: ReturnType<typeof createMockSupabaseClient>
let mockAdminClient: ReturnType<typeof createMockAdminClient>

vi.mock('@/shared/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => Promise.resolve(mockClient)),
}))

vi.mock('@/shared/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Import module under test AFTER mocks are declared
// ---------------------------------------------------------------------------

const {
  createSticker,
  updateSticker,
  deleteSticker,
  createTag,
  updateTag,
  deleteTag,
  updateStock,
} = await import('@/features/stickers/actions')

const { revalidatePath } = await import('next/cache')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('actions integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminClient = createMockAdminClient()
  })

  // -----------------------------------------------------------------------
  // createSticker
  // -----------------------------------------------------------------------

  describe('createSticker', () => {
    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await createSticker(VALID_STICKER_INPUT)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('creates sticker with valid data', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { ...MOCK_CREATED_STICKER },
          error: null,
        },
      })

      const result = await createSticker(VALID_STICKER_INPUT)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: 'sticker-new',
        name_es: 'Luna',
      })
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('creates sticker with tag_ids', async () => {
      const tagId = '550e8400-e29b-41d4-a716-446655440000'
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { ...MOCK_CREATED_STICKER },
          error: null,
        },
        sticker_tags: {
          data: null,
          error: null,
        },
      })

      const input = {
        ...VALID_STICKER_INPUT,
        tag_ids: [tagId],
      }

      const result = await createSticker(input)

      expect(result.success).toBe(true)
      // Verify sticker_tags insert was attempted
      expect(mockClient.from).toHaveBeenCalledWith('sticker_tags')
    })

    it('returns error on invalid data (schema validation)', async () => {
      mockClient = createMockSupabaseClient()

      const invalidInput = {
        model_number: 'invalid',
        name_es: '',
        name_en: '',
        slug: '',
        base_type: 'invalid',
        price_ars: -100,
      }

      const result = await createSticker(invalidInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error when supabase insert fails', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Duplicate slug' },
        },
      })

      const result = await createSticker(VALID_STICKER_INPUT)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Duplicate slug')
    })
  })

  // -----------------------------------------------------------------------
  // updateSticker
  // -----------------------------------------------------------------------

  describe('updateSticker', () => {
    it('updates sticker with valid data', async () => {
      const updatedSticker = {
        ...MOCK_CREATED_STICKER,
        name_es: 'Luna Llena',
      }

      mockClient = createMockSupabaseClient({
        stickers: {
          data: { ...updatedSticker },
          error: null,
        },
        sticker_tags: {
          data: null,
          error: null,
        },
      })

      const result = await updateSticker({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name_es: 'Luna Llena',
      })

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({ name_es: 'Luna Llena' })
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('updates sticker tag associations when tag_ids provided', async () => {
      const tagId = '550e8400-e29b-41d4-a716-446655440000'
      const stickerId = '660e8400-e29b-41d4-a716-446655440000'

      mockClient = createMockSupabaseClient({
        stickers: {
          data: { ...MOCK_CREATED_STICKER, id: stickerId },
          error: null,
        },
        sticker_tags: {
          data: null,
          error: null,
        },
      })

      const result = await updateSticker({
        id: stickerId,
        tag_ids: [tagId],
      })

      expect(result.success).toBe(true)
      // sticker_tags delete + insert should have occurred
      expect(mockClient.from).toHaveBeenCalledWith('sticker_tags')
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await updateSticker({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name_es: 'Nope',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when supabase update fails', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Row not found' },
        },
      })

      const result = await updateSticker({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name_es: 'Fail',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Row not found')
    })
  })

  // -----------------------------------------------------------------------
  // deleteSticker
  // -----------------------------------------------------------------------

  describe('deleteSticker', () => {
    it('deletes sticker and cleans up storage when image exists', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { image_path: 'stickers/luna.webp' },
          error: null,
        },
      })

      const result = await deleteSticker('sticker-1')

      expect(result.success).toBe(true)
      expect(mockAdminClient.storage.from).toHaveBeenCalledWith(
        'sticker-images'
      )
      expect(mockAdminClient._removeFn).toHaveBeenCalledWith([
        'stickers/luna.webp',
      ])
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('deletes sticker without image (no storage cleanup)', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { image_path: null },
          error: null,
        },
      })

      const result = await deleteSticker('sticker-2')

      expect(result.success).toBe(true)
      expect(mockAdminClient.storage.from).not.toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await deleteSticker('sticker-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when supabase delete fails', async () => {
      // First call (select image_path) succeeds, second call (delete) fails
      // Since we use a single table result, we need to handle this differently
      // The mock will return the same result for all `from('stickers')` calls
      // The select().eq().single() for image_path will get the same result
      // but the actual delete will also resolve with the same result
      // We set error so the delete path returns error
      mockClient = createMockSupabaseClient({
        stickers: {
          data: { image_path: null },
          error: { message: 'Foreign key constraint' },
        },
      })

      const result = await deleteSticker('sticker-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Foreign key constraint')
    })
  })

  // -----------------------------------------------------------------------
  // createTag
  // -----------------------------------------------------------------------

  describe('createTag', () => {
    it('creates tag with valid data', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: { ...MOCK_CREATED_TAG },
          error: null,
        },
      })

      const result = await createTag(VALID_TAG_INPUT)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: 'tag-new',
        name_es: 'Anime',
        slug: 'anime',
      })
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await createTag(VALID_TAG_INPUT)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error on invalid data', async () => {
      mockClient = createMockSupabaseClient()

      const result = await createTag({ name_es: '', name_en: '', slug: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error when supabase insert fails', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: { message: 'Duplicate slug' },
        },
      })

      const result = await createTag(VALID_TAG_INPUT)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Duplicate slug')
    })
  })

  // -----------------------------------------------------------------------
  // updateTag
  // -----------------------------------------------------------------------

  describe('updateTag', () => {
    it('updates tag with valid data', async () => {
      const updatedTag = {
        ...MOCK_CREATED_TAG,
        name_es: 'Anime JP',
      }

      mockClient = createMockSupabaseClient({
        tags: {
          data: { ...updatedTag },
          error: null,
        },
      })

      const result = await updateTag({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name_es: 'Anime JP',
      })

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({ name_es: 'Anime JP' })
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await updateTag({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name_es: 'Nope',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  // -----------------------------------------------------------------------
  // deleteTag
  // -----------------------------------------------------------------------

  describe('deleteTag', () => {
    it('deletes tag successfully', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: null,
        },
      })

      const result = await deleteTag('tag-1')

      expect(result.success).toBe(true)
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await deleteTag('tag-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when supabase delete fails', async () => {
      mockClient = createMockSupabaseClient({
        tags: {
          data: null,
          error: { message: 'Tag is in use' },
        },
      })

      const result = await deleteTag('tag-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tag is in use')
    })
  })

  // -----------------------------------------------------------------------
  // updateStock
  // -----------------------------------------------------------------------

  describe('updateStock', () => {
    it('updates multiple stock values', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: null,
        },
      })

      const updates = [
        { id: 'sticker-1', stock: 20 },
        { id: 'sticker-2', stock: 15 },
      ]

      const result = await updateStock(updates)

      expect(result.success).toBe(true)
      expect(revalidatePath).toHaveBeenCalled()
    })

    it('returns unauthorized when user is not admin', async () => {
      mockClient = createMockSupabaseClient({}, { isAdmin: false })

      const result = await updateStock([{ id: 'sticker-1', stock: 10 }])

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when a stock update fails', async () => {
      mockClient = createMockSupabaseClient({
        stickers: {
          data: null,
          error: { message: 'Invalid stock value' },
        },
      })

      const result = await updateStock([{ id: 'sticker-1', stock: 10 }])

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to update stock')
    })

    it('handles empty updates array', async () => {
      mockClient = createMockSupabaseClient()

      const result = await updateStock([])

      expect(result.success).toBe(true)
    })
  })
})
