'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/features/i18n/navigation'
import { localeNames, type Locale } from '@/features/i18n/config'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const nextLocale: Locale = locale === 'es' ? 'en' : 'es'

  function handleToggle() {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Switch to ${localeNames[nextLocale]}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{localeNames[nextLocale]}</span>
    </button>
  )
}
