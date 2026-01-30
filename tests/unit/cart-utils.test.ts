import { describe, it, expect } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/features/cart/utils'
import type { CartItem } from '@/features/cart/types'

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'item-1',
    model_number: 'STK-001',
    name_es: 'Calco Patagonia',
    name_en: 'Patagonia Sticker',
    slug: 'calco-patagonia',
    base_type: 'base_blanca',
    price_ars: 1500,
    image_url: null,
    quantity: 2,
    max_stock: 10,
    ...overrides,
  }
}

describe('buildWhatsAppMessage', () => {
  it('generates Spanish format with single item', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'es')

    expect(message).toContain('Hola! Quiero hacer un pedido:')
    expect(message).toContain('STK-001')
    expect(message).toContain('Calco Patagonia')
    expect(message).toContain('Base Blanca')
    expect(message).toContain('x2')
    expect(message).toContain('*Total:')
  })

  it('generates English format with single item', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'en')

    expect(message).toContain('Hi! I would like to place an order:')
    expect(message).toContain('STK-001')
    expect(message).toContain('Patagonia Sticker')
    expect(message).toContain('White Base')
    expect(message).toContain('x2')
    expect(message).toContain('*Total:')
  })

  it('includes all item lines for multiple items', () => {
    const items = [
      makeCartItem({ id: 'a', model_number: 'STK-001', name_es: 'Calco A' }),
      makeCartItem({ id: 'b', model_number: 'STK-002', name_es: 'Calco B', base_type: 'base_holografica' }),
    ]

    const message = buildWhatsAppMessage(items, 'es')

    expect(message).toContain('STK-001')
    expect(message).toContain('Calco A')
    expect(message).toContain('STK-002')
    expect(message).toContain('Calco B')
    expect(message).toContain('Base Blanca')
    expect(message).toContain('Base Hologr')
  })

  it('includes customer name when provided', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'es', { name: 'Juan' })

    expect(message).toContain('Nombre: Juan')
  })

  it('includes customer name and city when both provided', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'es', {
      name: 'Juan',
      city: 'Neuquen',
    })

    expect(message).toContain('Nombre: Juan')
    expect(message).toContain('Ciudad: Neuquen')
  })

  it('uses English labels for name and city', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'en', {
      name: 'John',
      city: 'London',
    })

    expect(message).toContain('Name: John')
    expect(message).toContain('City: London')
  })

  it('omits info section when checkout info is not provided', () => {
    const items = [makeCartItem()]

    const message = buildWhatsAppMessage(items, 'es')

    expect(message).not.toContain('Nombre:')
    expect(message).not.toContain('Ciudad:')
    expect(message).not.toContain('Name:')
    expect(message).not.toContain('City:')
  })
})

describe('buildWhatsAppUrl', () => {
  it('encodes message properly', () => {
    const message = 'Hola! Quiero pedir'

    const url = buildWhatsAppUrl(message)

    expect(url).toContain(encodeURIComponent(message))
  })

  it('contains WhatsApp base URL and phone number', () => {
    const url = buildWhatsAppUrl('test')

    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  })

  it('handles special characters in message', () => {
    const message = 'Item: *bold* & "quotes"'

    const url = buildWhatsAppUrl(message)

    expect(url).toContain(encodeURIComponent(message))
    expect(url).not.toContain(' & ')
  })
})
