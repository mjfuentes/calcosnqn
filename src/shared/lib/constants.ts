export const SITE_NAME = 'CalcosNQN'
export const SITE_DESCRIPTION_ES = 'Calcos y stickers de la Patagonia Argentina'
export const SITE_DESCRIPTION_EN = 'Stickers from Patagonia, Argentina'

export const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '5492994000000'
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const STICKER_IMAGE_BUCKET = 'sticker-images'
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const LOW_STOCK_THRESHOLD = 5

export const ITEMS_PER_PAGE = 24

export const BASE_TYPE_LABELS = {
  es: {
    base_blanca: 'Base Blanca',
    base_holografica: 'Base Holográfica',
  },
  en: {
    base_blanca: 'White Base',
    base_holografica: 'Holographic Base',
  },
} as const
