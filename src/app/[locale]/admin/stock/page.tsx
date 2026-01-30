import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAdminStickers } from '@/features/stickers/admin-queries'
import { StockManager } from '@/features/admin/components/stock-manager'
import type { StickerWithTags } from '@/features/stickers/types'

interface StockPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminStockPage({ params }: StockPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.stock' })

  let stickers: StickerWithTags[] = []
  try {
    stickers = await getAdminStickers()
  } catch {
    // DB might not be ready
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <StockManager stickers={stickers} />
    </div>
  )
}
