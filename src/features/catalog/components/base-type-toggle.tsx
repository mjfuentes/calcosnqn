'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/shared/lib/utils'
import type { BaseType } from '@/features/stickers/types'

interface BaseTypeToggleProps {
  value: BaseType | undefined
  onChange: (value: BaseType | undefined) => void
}

export function BaseTypeToggle({ value, onChange }: BaseTypeToggleProps) {
  const t = useTranslations('catalog.filters')

  const options: Array<{ key: BaseType | undefined; label: string }> = [
    { key: undefined, label: t('all') },
    { key: 'base_blanca', label: t('whiteBase') },
    { key: 'base_holografica', label: t('holographicBase') },
  ]

  return (
    <div className="flex rounded-lg border border-border bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.key ?? 'all'}
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm transition-colors',
            value === option.key
              ? 'bg-accent text-black font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
