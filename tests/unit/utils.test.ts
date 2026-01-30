import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPrice,
  getLocalizedName,
  getLocalizedDescription,
  slugify,
} from '@/shared/lib/utils'

describe('cn', () => {
  it('joins string classes with a space', () => {
    const result = cn('px-4', 'py-2', 'text-white')

    expect(result).toBe('px-4 py-2 text-white')
  })

  it('filters out false, undefined, and null', () => {
    const result = cn('px-4', false, undefined, 'py-2', null)

    expect(result).toBe('px-4 py-2')
  })

  it('returns empty string for no arguments', () => {
    const result = cn()

    expect(result).toBe('')
  })

  it('returns empty string when all arguments are falsy', () => {
    const result = cn(false, undefined, null)

    expect(result).toBe('')
  })
})

describe('formatPrice', () => {
  it('formats as ARS currency', () => {
    const result = formatPrice(1500)

    expect(result).toContain('1.500')
    expect(result).toContain('$')
  })

  it('handles 0', () => {
    const result = formatPrice(0)

    expect(result).toContain('0')
    expect(result).toContain('$')
  })

  it('truncates decimals to 0 fraction digits', () => {
    const result = formatPrice(1500.99)

    expect(result).not.toContain(',99')
    expect(result).not.toContain('.99')
    expect(result).toContain('1.501')
  })

  it('formats large numbers with separators', () => {
    const result = formatPrice(1000000)

    expect(result).toContain('1.000.000')
  })
})

describe('getLocalizedName', () => {
  const item = { name_es: 'Calco Luna', name_en: 'Moon Sticker' }

  it('returns name_es for locale es', () => {
    const result = getLocalizedName(item, 'es')

    expect(result).toBe('Calco Luna')
  })

  it('returns name_en for locale en', () => {
    const result = getLocalizedName(item, 'en')

    expect(result).toBe('Moon Sticker')
  })
})

describe('getLocalizedDescription', () => {
  it('returns description_es for locale es', () => {
    const item = {
      description_es: 'Una calco bonita',
      description_en: 'A pretty sticker',
    }

    const result = getLocalizedDescription(item, 'es')

    expect(result).toBe('Una calco bonita')
  })

  it('returns description_en for locale en', () => {
    const item = {
      description_es: 'Una calco bonita',
      description_en: 'A pretty sticker',
    }

    const result = getLocalizedDescription(item, 'en')

    expect(result).toBe('A pretty sticker')
  })

  it('returns null when description is null for es', () => {
    const item = {
      description_es: null,
      description_en: 'A pretty sticker',
    }

    const result = getLocalizedDescription(item, 'es')

    expect(result).toBeNull()
  })

  it('returns null when description is null for en', () => {
    const item = {
      description_es: 'Una calco bonita',
      description_en: null,
    }

    const result = getLocalizedDescription(item, 'en')

    expect(result).toBeNull()
  })
})

describe('slugify', () => {
  it('converts text to lowercase', () => {
    const result = slugify('HELLO WORLD')

    expect(result).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    const result = slugify('hello world')

    expect(result).toBe('hello-world')
  })

  it('removes accents via NFD normalization', () => {
    const result = slugify('cafe con leche')

    expect(result).toBe('cafe-con-leche')

    expect(slugify('Patagonia')).toBe('patagonia')
    expect(slugify('Hologr\u00e1fica')).toBe('holografica')
  })

  it('removes special characters', () => {
    const result = slugify('hello! @world# $test')

    expect(result).toBe('hello-world-test')
  })

  it('trims leading and trailing hyphens', () => {
    const result = slugify('--hello--')

    expect(result).toBe('hello')
  })

  it('handles multiple consecutive spaces/special chars', () => {
    const result = slugify('hello   world   test')

    expect(result).toBe('hello-world-test')
  })

  it('handles empty string', () => {
    const result = slugify('')

    expect(result).toBe('')
  })
})
