'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/shared/components/ui'
import { useCartStore } from '../store'
import { getLocalizedName, formatPrice } from '@/shared/lib/utils'
import { PRODUCT_TYPE_LABELS } from '@/shared/lib/constants'
import type { CartItem } from '../types'
import type { Locale } from '@/features/i18n/config'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('cart')
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const name = getLocalizedName(item, locale)

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-background">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm font-mono text-accent/30">
              {item.model_number}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted font-mono">{item.model_number}</p>
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {PRODUCT_TYPE_LABELS[locale][item.product_type]}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">{name}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              aria-label={`Decrease quantity`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2ch] text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.max_stock}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Increase quantity`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-accent">
              {formatPrice(item.price_ars * item.quantity)}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="rounded p-1 text-muted hover:text-danger transition-colors"
              aria-label={t('remove')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
