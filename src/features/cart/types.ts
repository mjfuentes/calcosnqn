import type { BaseType } from '@/shared/lib/supabase/types'

export interface CartItem {
  id: string
  model_number: string
  name_es: string
  name_en: string
  slug: string
  base_type: BaseType
  price_ars: number
  image_url: string | null
  quantity: number
  max_stock: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}
