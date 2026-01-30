import { useTranslations } from 'next-intl'
import { Link } from '@/features/i18n/navigation'
import { Button } from '@/shared/components/ui'

export default function NotFound() {
  const t = useTranslations('common')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-8xl font-bold font-mono text-accent">404</span>
      <p className="text-lg text-muted-foreground">{t('noResults')}</p>
      <Link href="/">
        <Button variant="outline">{t('back')}</Button>
      </Link>
    </div>
  )
}
