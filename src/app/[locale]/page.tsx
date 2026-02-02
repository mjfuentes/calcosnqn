import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/features/i18n/navigation'
import { getFeaturedStickers } from '@/features/stickers/queries'
import { StickerGrid } from '@/features/catalog/components/sticker-grid'
import { Button } from '@/shared/components/ui'
import { ArrowRight, Sticker, Coffee, Magnet } from 'lucide-react'
import type { Locale } from '@/features/i18n/config'
import type { StickerWithTags } from '@/features/stickers/types'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  let featured: StickerWithTags[] = []
  try {
    featured = await getFeaturedStickers()
  } catch {
    // DB might not be ready yet — render page without data
  }

  const typedLocale = locale as Locale

  return (
    <>
      {/* Banner */}
      <section className="relative mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-8">
        <Image
          src="/banner.png"
          alt="CalcosNQN"
          width={1920}
          height={600}
          className="w-full rounded-xl object-cover"
          priority
        />
      </section>

      {/* Product Type Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { key: 'calco' as const, icon: Sticker, href: '/catalogo?product_type=calco' },
            { key: 'jarro' as const, icon: Coffee, href: '/catalogo?product_type=jarro' },
            { key: 'iman' as const, icon: Magnet, href: '/catalogo?product_type=iman' },
          ].map(({ key, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:border-accent hover:bg-accent-muted sm:gap-3 sm:p-8"
            >
              <Icon className="h-6 w-6 text-accent transition-transform group-hover:scale-110 sm:h-8 sm:w-8" />
              <h3 className="text-sm font-semibold sm:text-lg">
                {t(`home.productTypes.${key}`)}
              </h3>
              <p className="hidden text-sm text-muted-foreground sm:block">
                {t(`home.productTypes.${key}Desc`)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('home.featured.title')}</h2>
            <Link
              href="/catalogo"
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              {t('home.featured.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <StickerGrid stickers={featured} />
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">
            {typedLocale === 'es'
              ? 'Explora todos nuestros productos'
              : 'Explore all our products'}
          </h2>
          <Link href="/catalogo">
            <Button size="lg" variant="outline">
              {t('home.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {typedLocale === 'es' ? 'Nos acompañan' : 'Our sponsors'}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { src: '/sponsors/travesia.png', alt: 'Travesía' },
              { src: '/sponsors/beitia.webp', alt: 'Beitia' },
              { src: '/sponsors/brza.png', alt: 'Brza' },
              { src: '/sponsors/trapito.png', alt: 'Trapito' },
              { src: '/sponsors/axion.png', alt: 'Axion' },
            ].map(({ src, alt }) => (
              <Image
                key={alt}
                src={src}
                alt={alt}
                width={120}
                height={60}
                className="h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
