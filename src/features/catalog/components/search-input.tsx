'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDebounce } from '@/shared/hooks/use-debounce'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const t = useTranslations('catalog')
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 300)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    onChangeRef.current(debouncedValue)
  }, [debouncedValue])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={t('search')}
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted transition-colors hover:border-border-hover focus:border-accent focus:outline-none"
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
