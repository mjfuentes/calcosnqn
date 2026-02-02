'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { SearchInput } from './search-input'
import { TagFilterBar } from './tag-filter-bar'
import { BaseTypeToggle } from './base-type-toggle'
import { ProductTypeTabs } from './product-type-tabs'
import { SortSelect } from './sort-select'
import { StickerGrid } from './sticker-grid'
import { Button } from '@/shared/components/ui'
import type { StickerWithTags, Tag, BaseType, ProductType } from '@/features/stickers/types'

interface CatalogViewProps {
  stickers: StickerWithTags[]
  tags: Tag[]
  total: number
  hasMore: boolean
}

export function CatalogView({
  stickers,
  tags,
  total,
  hasMore,
}: CatalogViewProps) {
  const t = useTranslations('catalog')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentSearch = searchParams.get('search') ?? ''
  const currentTag = searchParams.get('tag') ?? undefined
  const currentProductType = (searchParams.get('product_type') as ProductType) ?? undefined
  const currentBaseType = (searchParams.get('base_type') as BaseType) ?? undefined
  const currentSort =
    (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc' | 'name_asc') ?? undefined
  const currentPage = Number(searchParams.get('page') ?? '1')

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      // Reset page when filters change (unless page itself is being changed)
      if (!('page' in updates)) {
        params.delete('page')
      }

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [searchParams, router, pathname]
  )

  const hasFilters = currentSearch || currentTag || currentProductType || currentBaseType || currentSort

  return (
    <div className="space-y-6">
      <ProductTypeTabs
        value={currentProductType}
        onChange={(value) => updateParams({ product_type: value, base_type: undefined })}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={currentSearch}
            onChange={(value) => updateParams({ search: value || undefined })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {currentProductType === 'calco' && (
            <BaseTypeToggle
              value={currentBaseType}
              onChange={(value) => updateParams({ base_type: value })}
            />
          )}
          <SortSelect
            value={currentSort}
            onChange={(value) => updateParams({ sort: value })}
          />
        </div>
      </div>

      <TagFilterBar
        tags={tags}
        selectedTag={currentTag}
        onTagChange={(tag) => updateParams({ tag })}
      />

      {stickers.length > 0 ? (
        <>
          <p className="text-sm text-muted">
            {total} {total === 1
              ? t('resultSingular')
              : t('resultPlural')}
          </p>
          <StickerGrid stickers={stickers} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  updateParams({ page: String(currentPage + 1) })
                }
              >
                Ver mas
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">{t('noResults')}</p>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => router.push(pathname)}
            >
              {t('clearFilters')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
