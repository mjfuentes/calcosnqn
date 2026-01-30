import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/features/i18n/navigation'
import { getAdminStickers } from '@/features/stickers/admin-queries'
import { StickerTable } from '@/features/admin/components/sticker-table'
import { Button } from '@/shared/components/ui'
import { Plus } from 'lucide-react'
import type { StickerWithTags } from '@/features/stickers/types'

interface StickersPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminStickersPage({ params }: StickersPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.stickers' })

  let stickers: StickerWithTags[] = []
  try {
    stickers = await getAdminStickers()
  } catch {
    // DB might not be ready
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href="/admin/stickers/new">
          <Button>
            <Plus className="h-4 w-4" />
            {t('new')}
          </Button>
        </Link>
      </div>
      <StickerTable stickers={stickers} />
    </div>
  )
}
