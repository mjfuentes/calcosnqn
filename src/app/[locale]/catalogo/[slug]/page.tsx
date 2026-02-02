import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getStickerBySlug, getRelatedStickers } from '@/features/stickers/queries'
import { StickerGrid } from '@/features/catalog/components/sticker-grid'
import { AddToCartButton } from '@/features/catalog/components/add-to-cart-button'
import { Badge } from '@/shared/components/ui'
import { formatPrice, getLocalizedName, getLocalizedDescription } from '@/shared/lib/utils'
import { PRODUCT_TYPE_LABELS } from '@/shared/lib/constants'
import type { Locale } from '@/features/i18n/config'

interface StickerPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: StickerPageProps) {
  const { locale, slug } = await params
  const sticker = await getStickerBySlug(slug)

  if (!sticker) return { title: 'Not Found' }

  const name = getLocalizedName(sticker, locale as Locale)
  return {
    title: `${sticker.model_number} ${name}`,
    description: getLocalizedDescription(sticker, locale as Locale) ?? name,
  }
}

export default async function StickerDetailPage({ params }: StickerPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const sticker = await getStickerBySlug(slug)
  if (!sticker) notFound()

  const t = await getTranslations({ locale, namespace: 'sticker' })
  const typedLocale = locale as Locale
  const name = getLocalizedName(sticker, typedLocale)
  const description = getLocalizedDescription(sticker, typedLocale)
  const productTypeLabel = PRODUCT_TYPE_LABELS[typedLocale][sticker.product_type]
  const baseLabel = sticker.base_type
    ? sticker.base_type === 'base_holografica'
      ? t('holographicBase')
      : t('whiteBase')
    : null

  const related = await getRelatedStickers(
    sticker.id,
    sticker.tags.map((tag) => tag.id)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
          {sticker.image_url ? (
            <Image
              src={sticker.image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl font-mono font-bold text-accent/20">
                {sticker.model_number}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted font-mono">
              {t('model')} {sticker.model_number}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">{name}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{productTypeLabel}</Badge>
            {baseLabel && (
              <Badge
                variant={
                  sticker.base_type === 'base_holografica' ? 'accent' : 'default'
                }
              >
                {baseLabel}
              </Badge>
            )}
            {sticker.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {getLocalizedName(tag, typedLocale)}
              </Badge>
            ))}
          </div>

          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}

          <div className="mt-2">
            <p className="text-3xl font-bold text-accent">
              {formatPrice(Number(sticker.price_ars))}
            </p>
            <p className="mt-1 text-sm text-muted">
              {sticker.stock > 0
                ? `${t('stock')}: ${sticker.stock}`
                : t('outOfStock')}
            </p>
          </div>

          <div className="mt-4">
            <AddToCartButton sticker={sticker} size="lg" />
          </div>
        </div>
      </div>

      {/* Related stickers */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">{t('related')}</h2>
          <StickerGrid stickers={related} />
        </section>
      )}
    </div>
  )
}
