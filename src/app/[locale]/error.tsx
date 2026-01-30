'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('common')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl font-bold font-mono text-danger">!</span>
      <p className="text-lg text-muted-foreground">{t('error')}</p>
      <Button variant="outline" onClick={reset}>
        {t('retry')}
      </Button>
    </div>
  )
}
