import { z } from 'zod/v4'

export const baseTypeSchema = z.enum(['base_blanca', 'base_holografica'])
export const productTypeSchema = z.enum(['calco', 'jarro', 'iman'])
export const stickerStatusSchema = z.enum(['active', 'draft', 'archived'])

export const createStickerSchema = z.object({
  model_number: z
    .string({ error: 'Model number is required' })
    .min(1, 'Model number is required')
    .regex(/^#\d{3,}$/, 'Model number must be like #001'),
  name_es: z.string({ error: 'Spanish name is required' }).min(1, 'Spanish name is required'),
  name_en: z.string({ error: 'English name is required' }).min(1, 'English name is required'),
  description_es: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  slug: z.string({ error: 'Slug is required' }).min(1, 'Slug is required'),
  product_type: productTypeSchema.default('calco'),
  base_type: baseTypeSchema.nullable().optional(),
  price_ars: z
    .number({ error: 'Price is required' })
    .positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  image_url: z.string().url().nullable().optional(),
  image_path: z.string().nullable().optional(),
  status: stickerStatusSchema.default('draft'),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  tag_ids: z.array(z.string().uuid()).optional(),
})

export const updateStickerSchema = createStickerSchema.partial().extend({
  id: z.string().uuid(),
})

export const createTagSchema = z.object({
  name_es: z.string().min(1, 'Spanish name is required'),
  name_en: z.string().min(1, 'English name is required'),
  slug: z.string().min(1, 'Slug is required'),
})

export const updateTagSchema = createTagSchema.partial().extend({
  id: z.string().uuid(),
})

export const imageUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPG, PNG, and WebP are allowed'
  ),
})

export const catalogFilterSchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  product_type: productTypeSchema.optional(),
  base_type: baseTypeSchema.optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional(),
  page: z.coerce.number().int().positive().optional(),
})

export type CreateStickerInput = z.infer<typeof createStickerSchema>
export type UpdateStickerInput = z.infer<typeof updateStickerSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CatalogFilter = z.infer<typeof catalogFilterSchema>
