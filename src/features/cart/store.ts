'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState } from './types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === newItem.id)

          if (existing) {
            const newQuantity = Math.min(
              existing.quantity + 1,
              existing.max_stock
            )
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            }
          }
          return {
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, quantity: Math.min(quantity, item.max_stock) }
                : item
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price_ars * item.quantity,
          0
        ),
    }),
    {
      name: 'calcosnqn-cart',
      skipHydration: true,
    }
  )
)
