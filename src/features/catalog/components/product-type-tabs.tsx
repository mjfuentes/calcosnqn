'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/shared/lib/utils'
import type { ProductType } from '@/features/stickers/types'

interface ProductTypeTabsProps {
  value: ProductType | undefined
  onChange: (value: ProductType | undefined) => void
}

const PRODUCT_TYPES: Array<{ key: ProductType | undefined; labelKey: string }> = [
  { key: undefined, labelKey: 'all' },
  { key: 'calco', labelKey: 'calco' },
  { key: 'jarro', labelKey: 'jarro' },
  { key: 'iman', labelKey: 'iman' },
]

export function ProductTypeTabs({ value, onChange }: ProductTypeTabsProps) {
  const t = useTranslations('catalog.productTypes')

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {PRODUCT_TYPES.map((option) => (
        <button
          key={option.key ?? 'all'}
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            value === option.key
              ? 'bg-accent text-black'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
          )}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  )
}
