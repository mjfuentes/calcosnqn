'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/features/i18n/navigation'
import { Badge } from '@/shared/components/ui'
import { getLocalizedName, formatPrice } from '@/shared/lib/utils'
import type { StickerWithTags } from '@/features/stickers/types'
import type { Locale } from '@/features/i18n/config'

interface StickerCardProps {
  sticker: StickerWithTags
}

export function StickerCard({ sticker }: StickerCardProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('sticker')

  const name = getLocalizedName(sticker, locale)
  const baseLabel =
    sticker.base_type === 'base_holografica'
      ? t('holographicBase')
      : t('whiteBase')

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

        {sticker.base_type === 'base_holografica' && (
          <Badge
            variant="accent"
            className="absolute left-2 top-2"
          >
            {baseLabel}
          </Badge>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-muted font-mono">{sticker.model_number}</p>
        <h3 className="mt-0.5 text-sm font-medium text-foreground truncate">
          {name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-accent">
          {formatPrice(sticker.price_ars)}
        </p>
      </div>
    </Link>
  )
}
