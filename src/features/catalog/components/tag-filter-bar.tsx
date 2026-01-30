'use client'

import { useLocale, useTranslations } from 'next-intl'
import { cn, getLocalizedName } from '@/shared/lib/utils'
import type { Tag } from '@/features/stickers/types'
import type { Locale } from '@/features/i18n/config'

interface TagFilterBarProps {
  tags: Tag[]
  selectedTag: string | undefined
  onTagChange: (tag: string | undefined) => void
}

export function TagFilterBar({
  tags,
  selectedTag,
  onTagChange,
}: TagFilterBarProps) {
  const locale = useLocale() as Locale
  const t = useTranslations('catalog.filters')

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onTagChange(undefined)}
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
          !selectedTag
            ? 'bg-accent text-black font-medium'
            : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
        )}
      >
        {t('all')}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() =>
            onTagChange(selectedTag === tag.slug ? undefined : tag.slug)
          }
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
            selectedTag === tag.slug
              ? 'bg-accent text-black font-medium'
              : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
          )}
        >
          {getLocalizedName(tag, locale)}
        </button>
      ))}
    </div>
  )
}
