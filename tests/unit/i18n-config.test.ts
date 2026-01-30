import { describe, it, expect } from 'vitest'
import {
  locales,
  defaultLocale,
  localeNames,
} from '@/features/i18n/config'

describe('i18n config', () => {
  describe('locales', () => {
    it('includes es and en', () => {
      expect(locales).toContain('es')
      expect(locales).toContain('en')
    })

    it('has exactly 2 entries', () => {
      expect(locales).toHaveLength(2)
    })
  })

  describe('defaultLocale', () => {
    it('is es', () => {
      expect(defaultLocale).toBe('es')
    })

    it('is included in locales', () => {
      expect(locales).toContain(defaultLocale)
    })
  })

  describe('localeNames', () => {
    it('maps es to Espanol', () => {
      expect(localeNames.es).toBe('Espa\u00f1ol')
    })

    it('maps en to English', () => {
      expect(localeNames.en).toBe('English')
    })

    it('has entries for all locales', () => {
      for (const locale of locales) {
        expect(localeNames[locale]).toBeDefined()
        expect(typeof localeNames[locale]).toBe('string')
      }
    })
  })
})
