'use client'

import { useTranslations } from 'next-intl'
import { useCartStore } from '../store'
import { formatPrice } from '@/shared/lib/utils'

export function CartSummary() {
  const t = useTranslations('cart')
  const totalPrice = useCartStore((state) => state.totalPrice())

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>{t('total')}</span>
        <span className="text-accent">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  )
}
