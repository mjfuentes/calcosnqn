import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/features/cart/store'
import type { CartItem } from '@/features/cart/types'

type CartItemWithoutQuantity = Omit<CartItem, 'quantity'>

function makeCartItem(overrides: Partial<CartItemWithoutQuantity> = {}): CartItemWithoutQuantity {
  return {
    id: 'item-1',
    model_number: 'STK-001',
    name_es: 'Calco Patagonia',
    name_en: 'Patagonia Sticker',
    slug: 'calco-patagonia',
    base_type: 'base_blanca',
    price_ars: 1500,
    image_url: null,
    max_stock: 10,
    ...overrides,
  }
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  describe('initial state', () => {
    it('has empty items array', () => {
      const { items } = useCartStore.getState()

      expect(items).toEqual([])
    })
  })

  describe('addItem', () => {
    it('adds a new item with quantity 1', () => {
      const item = makeCartItem()

      useCartStore.getState().addItem(item)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual({ ...item, quantity: 1 })
    })

    it('increments quantity for existing item', () => {
      const item = makeCartItem()

      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('does not exceed max_stock', () => {
      const item = makeCartItem({ max_stock: 3 })

      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)
      useCartStore.getState().addItem(item)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(3)
    })
  })

  describe('removeItem', () => {
    it('removes item by id', () => {
      const item = makeCartItem()
      useCartStore.getState().addItem(item)

      useCartStore.getState().removeItem('item-1')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      const item = makeCartItem()
      useCartStore.getState().addItem(item)

      useCartStore.getState().removeItem('non-existent')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('item-1')
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity for existing item', () => {
      const item = makeCartItem()
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', 5)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(5)
    })

    it('removes item when quantity is 0', () => {
      const item = makeCartItem()
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', 0)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      const item = makeCartItem()
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', -1)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('clamps quantity to max_stock', () => {
      const item = makeCartItem({ max_stock: 5 })
      useCartStore.getState().addItem(item)

      useCartStore.getState().updateQuantity('item-1', 99)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(5)
    })
  })

  describe('clearCart', () => {
    it('empties items array', () => {
      useCartStore.getState().addItem(makeCartItem({ id: 'a' }))
      useCartStore.getState().addItem(makeCartItem({ id: 'b' }))

      useCartStore.getState().clearCart()

      const { items } = useCartStore.getState()
      expect(items).toEqual([])
    })
  })

  describe('totalItems', () => {
    it('sums all quantities', () => {
      useCartStore.getState().addItem(makeCartItem({ id: 'a' }))
      useCartStore.getState().addItem(makeCartItem({ id: 'b' }))
      useCartStore.getState().addItem(makeCartItem({ id: 'a' }))

      const total = useCartStore.getState().totalItems()

      expect(total).toBe(3)
    })

    it('returns 0 for empty cart', () => {
      const total = useCartStore.getState().totalItems()

      expect(total).toBe(0)
    })
  })

  describe('totalPrice', () => {
    it('sums price_ars multiplied by quantity', () => {
      useCartStore.getState().addItem(makeCartItem({ id: 'a', price_ars: 1000 }))
      useCartStore.getState().addItem(makeCartItem({ id: 'b', price_ars: 2500 }))
      useCartStore.getState().addItem(makeCartItem({ id: 'a', price_ars: 1000 }))

      const total = useCartStore.getState().totalPrice()

      expect(total).toBe(1000 * 2 + 2500 * 1)
    })

    it('returns 0 for empty cart', () => {
      const total = useCartStore.getState().totalPrice()

      expect(total).toBe(0)
    })
  })

  describe('immutability', () => {
    it('addItem does not mutate the original items array', () => {
      useCartStore.getState().addItem(makeCartItem({ id: 'a' }))

      const itemsBefore = useCartStore.getState().items
      useCartStore.getState().addItem(makeCartItem({ id: 'b' }))
      const itemsAfter = useCartStore.getState().items

      expect(itemsBefore).not.toBe(itemsAfter)
      expect(itemsBefore).toHaveLength(1)
      expect(itemsAfter).toHaveLength(2)
    })

    it('removeItem does not mutate the original items array', () => {
      useCartStore.getState().addItem(makeCartItem({ id: 'a' }))
      useCartStore.getState().addItem(makeCartItem({ id: 'b' }))

      const itemsBefore = useCartStore.getState().items
      useCartStore.getState().removeItem('a')
      const itemsAfter = useCartStore.getState().items

      expect(itemsBefore).not.toBe(itemsAfter)
      expect(itemsBefore).toHaveLength(2)
      expect(itemsAfter).toHaveLength(1)
    })
  })
})
