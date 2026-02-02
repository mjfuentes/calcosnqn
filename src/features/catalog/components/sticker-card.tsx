'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ShoppingCart, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from '@/features/i18n/navigation'
import { Badge } from '@/shared/components/ui'
import { getLocalizedName, formatPrice } from '@/shared/lib/utils'
import { useCartStore } from '@/features/cart/store'
import type { StickerWithTags } from '@/features/stickers/types'
import type { Locale } from '@/features/i18n/config'

interface StickerCardProps {
  sticker: StickerWithTags
}

export function StickerCard({ sticker }: StickerCardProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('sticker')
  const tCatalog = useTranslations('catalog.productTypes')
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const name = getLocalizedName(sticker, locale)

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: sticker.id,
      model_number: sticker.model_number,
      name_es: sticker.name_es,
      name_en: sticker.name_en,
      slug: sticker.slug,
      product_type: sticker.product_type,
      base_type: sticker.base_type,
      price_ars: Number(sticker.price_ars),
      image_url: sticker.image_url,
      max_stock: sticker.stock,
    })
    setAdded(true)
    toast.success(t('added'))
    setTimeout(() => setAdded(false), 2000)
  }

  const showBaseTypeBadge =
    sticker.product_type === 'calco' && sticker.base_type === 'base_holografica'

  return (
    <Link
      href={`/catalogo/${sticker.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-hover hover:bg-surface-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        {sticker.image_url ? (
          <Image
            src={sticker.image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <span className="text-4xl font-mono font-bold text-accent/20">
              {sticker.model_number}
            </span>
          </div>
        )}

        {sticker.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge variant="danger">{t('outOfStock')}</Badge>
          </div>
        )}

        <div className="absolute left-2 top-2 flex gap-1">
          {sticker.product_type !== 'calco' && (
            <Badge variant="default">
              {tCatalog(sticker.product_type)}
            </Badge>
          )}
          {showBaseTypeBadge && (
            <Badge variant="accent">
              {t('holographicBase')}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-muted font-mono">{sticker.model_number}</p>
        <h3 className="mt-0.5 text-sm font-medium text-foreground truncate">
          {name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-accent">
            {formatPrice(sticker.price_ars)}
          </p>
          {sticker.stock > 0 && (
            <button
              onClick={handleQuickAdd}
              className="flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-medium text-black transition-colors hover:bg-accent-hover"
            >
              {added ? (
                <Check className="h-3 w-3" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
              {added ? t('added') : t('quickAdd')}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
