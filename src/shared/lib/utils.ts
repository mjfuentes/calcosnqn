import type { Locale } from '@/features/i18n/config'

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getLocalizedName(
  item: { name_es: string; name_en: string },
  locale: Locale
): string {
  return locale === 'en' ? item.name_en : item.name_es
}

export function getLocalizedDescription(
  item: { description_es: string | null; description_en: string | null },
  locale: Locale
): string | null {
  return locale === 'en' ? item.description_en : item.description_es
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
