'use client'

import { useTranslations } from 'next-intl'
import { ArrowUpDown } from 'lucide-react'

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

interface SortSelectProps {
  value: SortOption | undefined
  onChange: (value: SortOption) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const t = useTranslations('catalog.filters')

  return (
    <div className="relative flex items-center">
      <ArrowUpDown className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
      <select
        value={value ?? 'newest'}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-sm text-foreground cursor-pointer transition-colors hover:border-border-hover focus:border-accent focus:outline-none"
      >
        <option value="newest">{t('newest')}</option>
        <option value="price_asc">{t('priceAsc')}</option>
        <option value="price_desc">{t('priceDesc')}</option>
        <option value="name_asc">{t('nameAsc')}</option>
      </select>
    </div>
  )
}
