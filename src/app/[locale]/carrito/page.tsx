'use client'

import { useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'
import { Link } from '@/features/i18n/navigation'
import { Button } from '@/shared/components/ui'
import { useCartStore } from '@/features/cart/store'
import { CartItemRow, CartSummary, WhatsAppCheckoutButton } from '@/features/cart/components'

export default function CartPage() {
  const t = useTranslations('cart')
  const items = useCartStore((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted" />
        <h1 className="mt-4 text-2xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('empty')}</p>
        <Link href="/catalogo" className="mt-6 inline-block">
          <Button variant="outline">{t('continueShopping')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <CartSummary />
        <WhatsAppCheckoutButton />
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/catalogo"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    </div>
  )
}
