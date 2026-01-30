import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAdminStickerById } from '@/features/stickers/admin-queries'
import { getAllTags } from '@/features/stickers/queries'
import { StickerForm } from '@/features/admin/components/sticker-form'

interface EditStickerPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditStickerPage({
  params,
}: EditStickerPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.stickers' })

  const [sticker, tags] = await Promise.all([
    getAdminStickerById(id),
    getAllTags(),
  ])

  if (!sticker) notFound()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        {t('edit')} - {sticker.model_number}
      </h1>
      <StickerForm sticker={sticker} tags={tags} />
    </div>
  )
}
