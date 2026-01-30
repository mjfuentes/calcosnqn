import { describe, it, expect } from 'vitest'
import {
  createStickerSchema,
  createTagSchema,
  catalogFilterSchema,
  imageUploadSchema,
} from '@/features/stickers/schemas'

const validStickerInput = Object.freeze({
  model_number: '#001',
  name_es: 'Calcomanía Luna',
  name_en: 'Moon Sticker',
  slug: 'moon-sticker',
  base_type: 'base_blanca' as const,
  price_ars: 1500,
})

const fullStickerInput = Object.freeze({
  ...validStickerInput,
  description_es: 'Una calcomanía de luna',
  description_en: 'A moon sticker',
  stock: 10,
  image_url: 'https://example.com/moon.webp',
  image_path: '/images/moon.webp',
  status: 'active' as const,
  is_featured: true,
  sort_order: 5,
  tag_ids: ['550e8400-e29b-41d4-a716-446655440000'],
})

describe('createStickerSchema', () => {
  it('accepts valid complete input', () => {
    const result = createStickerSchema.safeParse(fullStickerInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.model_number).toBe('#001')
      expect(result.data.status).toBe('active')
      expect(result.data.stock).toBe(10)
      expect(result.data.is_featured).toBe(true)
      expect(result.data.sort_order).toBe(5)
    }
  })

  it('accepts valid minimal input and applies defaults', () => {
    const result = createStickerSchema.safeParse(validStickerInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stock).toBe(0)
      expect(result.data.status).toBe('draft')
      expect(result.data.is_featured).toBe(false)
      expect(result.data.sort_order).toBe(0)
    }
  })

  it('rejects model_number missing # prefix', () => {
    const input = { ...validStickerInput, model_number: '001' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects model_number with too few digits', () => {
    const input = { ...validStickerInput, model_number: '#01' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects empty name_es', () => {
    const input = { ...validStickerInput, name_es: '' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects empty name_en', () => {
    const input = { ...validStickerInput, name_en: '' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects empty slug', () => {
    const input = { ...validStickerInput, slug: '' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects invalid base_type', () => {
    const input = { ...validStickerInput, base_type: 'base_metalica' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects negative price', () => {
    const input = { ...validStickerInput, price_ars: -100 }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects zero price', () => {
    const input = { ...validStickerInput, price_ars: 0 }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects negative stock', () => {
    const input = { ...validStickerInput, stock: -1 }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects non-integer stock', () => {
    const input = { ...validStickerInput, stock: 2.5 }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects invalid image_url', () => {
    const input = { ...validStickerInput, image_url: 'not-a-url' }
    const result = createStickerSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('applies correct defaults for stock, status, is_featured, and sort_order', () => {
    const result = createStickerSchema.safeParse(validStickerInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stock).toBe(0)
      expect(result.data.status).toBe('draft')
      expect(result.data.is_featured).toBe(false)
      expect(result.data.sort_order).toBe(0)
    }
  })
})

describe('createTagSchema', () => {
  const validTagInput = Object.freeze({
    name_es: 'Anime',
    name_en: 'Anime',
    slug: 'anime',
  })

  it('accepts valid input', () => {
    const result = createTagSchema.safeParse(validTagInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validTagInput)
    }
  })

  it('rejects empty name_es', () => {
    const input = { ...validTagInput, name_es: '' }
    const result = createTagSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects empty name_en', () => {
    const input = { ...validTagInput, name_en: '' }
    const result = createTagSchema.safeParse(input)

    expect(result.success).toBe(false)
  })

  it('rejects empty slug', () => {
    const input = { ...validTagInput, slug: '' }
    const result = createTagSchema.safeParse(input)

    expect(result.success).toBe(false)
  })
})

describe('catalogFilterSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = catalogFilterSchema.safeParse({})

    expect(result.success).toBe(true)
  })

  it('accepts valid search string', () => {
    const result = catalogFilterSchema.safeParse({ search: 'luna' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe('luna')
    }
  })

  it('accepts valid base_type', () => {
    const result = catalogFilterSchema.safeParse({ base_type: 'base_holografica' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.base_type).toBe('base_holografica')
    }
  })

  it('accepts valid sort value', () => {
    const result = catalogFilterSchema.safeParse({ sort: 'price_asc' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sort).toBe('price_asc')
    }
  })

  it('rejects invalid sort value', () => {
    const result = catalogFilterSchema.safeParse({ sort: 'random' })

    expect(result.success).toBe(false)
  })

  it('coerces string page to number', () => {
    const result = catalogFilterSchema.safeParse({ page: '2' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
    }
  })

  it('rejects negative page', () => {
    const result = catalogFilterSchema.safeParse({ page: -1 })

    expect(result.success).toBe(false)
  })
})

describe('imageUploadSchema', () => {
  it('accepts valid JPEG file', () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' })
    const result = imageUploadSchema.safeParse({ file })

    expect(result.success).toBe(true)
  })

  it('accepts valid PNG file', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const result = imageUploadSchema.safeParse({ file })

    expect(result.success).toBe(true)
  })

  it('accepts valid WebP file', () => {
    const file = new File(['x'], 'test.webp', { type: 'image/webp' })
    const result = imageUploadSchema.safeParse({ file })

    expect(result.success).toBe(true)
  })

  it('rejects file larger than 5MB', () => {
    const largeBuffer = new ArrayBuffer(6 * 1024 * 1024)
    const file = new File([largeBuffer], 'big.jpg', { type: 'image/jpeg' })
    const result = imageUploadSchema.safeParse({ file })

    expect(result.success).toBe(false)
  })

  it('rejects invalid MIME type', () => {
    const file = new File(['x'], 'animation.gif', { type: 'image/gif' })
    const result = imageUploadSchema.safeParse({ file })

    expect(result.success).toBe(false)
  })
})
