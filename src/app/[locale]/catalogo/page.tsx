import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getStickers } from '@/features/stickers/queries'
import { getAllTags } from '@/features/stickers/queries'
import { CatalogView } from '@/features/catalog/components'
import { Skeleton } from '@/shared/components/ui'
import { ITEMS_PER_PAGE } from '@/shared/lib/constants'
import type { CatalogFilter } from '@/features/stickers/schemas'

interface CatalogPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'catalog' })

  return {
    title: t('title'),
  }
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent searchParams={sp} />
      </Suspense>
    </div>
  )
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const filters: CatalogFilter = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    tag: typeof searchParams.tag === 'string' ? searchParams.tag : undefined,
    product_type: ['calco', 'jarro', 'iman'].includes(searchParams.product_type as string)
      ? (searchParams.product_type as CatalogFilter['product_type'])
      : undefined,
    base_type: searchParams.base_type === 'base_blanca' || searchParams.base_type === 'base_holografica'
      ? searchParams.base_type
      : undefined,
    sort: ['newest', 'price_asc', 'price_desc', 'name_asc'].includes(searchParams.sort as string)
      ? (searchParams.sort as CatalogFilter['sort'])
      : undefined,
    page: typeof searchParams.page === 'string' ? Number(searchParams.page) : undefined,
  }

  const [{ stickers, total }, tags] = await Promise.all([
    getStickers(filters),
    getAllTags(),
  ])

  const currentPage = filters.page ?? 1
  const hasMore = currentPage * ITEMS_PER_PAGE < total

  return (
    <CatalogView
      stickers={stickers}
      tags={tags}
      total={total}
      hasMore={hasMore}
    />
  )
}

function CatalogSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
