import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/features/i18n/navigation'
import { getFeaturedStickers, getAllTags } from '@/features/stickers/queries'
import { StickerGrid } from '@/features/catalog/components/sticker-grid'
import { Button } from '@/shared/components/ui'
import { ArrowRight, Droplets, Sun, Fingerprint, Sparkles } from 'lucide-react'
import type { Locale } from '@/features/i18n/config'
import type { StickerWithTags, Tag } from '@/features/stickers/types'
import { getLocalizedName } from '@/shared/lib/utils'

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
  let tags: Tag[] = []

  try {
    ;[featured, tags] = await Promise.all([
      getFeaturedStickers(),
      getAllTags(),
    ])
  } catch {
    // DB might not be ready yet — render page without data
  }

  const typedLocale = locale as Locale

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#141414_0%_50%)] bg-[size:40px_40px] opacity-50" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
          <Image
            src="/calcosnqn-logo.jpg"
            alt="CalcosNQN"
            width={200}
            height={200}
            className="h-32 w-32 rounded-full object-cover md:h-48 md:w-48"
            priority
          />
          <h1 className="text-5xl font-bold text-accent md:text-7xl font-mono tracking-tight">
            CalcosNQN
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground md:text-xl">
            {t('home.hero.subtitle')}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { icon: Sparkles, label: t('home.hero.uvInk') },
              { icon: Droplets, label: t('home.hero.waterproof') },
              { icon: Fingerprint, label: t('home.hero.scratchproof') },
              { icon: Sun, label: t('home.hero.heatproof') },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('home.hero.idealFor')}
          </p>
          <Link href="/catalogo">
            <Button size="lg">
              {t('home.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Stickers */}
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

      {/* Category Highlights */}
      {tags.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold">
            {t('home.categories.title')}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {tags.slice(0, 8).map((tag) => (
              <Link
                key={tag.id}
                href={`/catalogo?tag=${tag.slug}`}
                className="flex items-center justify-center rounded-xl border border-border bg-surface p-6 text-center transition-colors hover:border-accent hover:bg-accent-muted"
              >
                <span className="text-sm font-medium">
                  {getLocalizedName(tag, typedLocale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">
            {typedLocale === 'es'
              ? 'Explora todos nuestros calcos'
              : 'Explore all our stickers'}
          </h2>
          <Link href="/catalogo">
            <Button size="lg" variant="outline">
              {t('home.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
