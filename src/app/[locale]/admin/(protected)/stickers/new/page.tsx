import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllTags } from '@/features/stickers/queries'
import { StickerForm } from '@/features/admin/components/sticker-form'
import type { Tag } from '@/features/stickers/types'

interface NewStickerPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewStickerPage({ params }: NewStickerPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.stickers' })

  let tags: Tag[] = []
  try {
    tags = await getAllTags()
  } catch {
    // DB might not be ready
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('new')}</h1>
      <StickerForm tags={tags} />
    </div>
  )
}
