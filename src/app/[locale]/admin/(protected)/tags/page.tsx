import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllTags } from '@/features/stickers/queries'
import { TagManager } from '@/features/admin/components/tag-manager'
import type { Tag } from '@/features/stickers/types'

interface TagsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminTagsPage({ params }: TagsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.tags' })

  let tags: Tag[] = []
  try {
    tags = await getAllTags()
  } catch {
    // DB might not be ready
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <TagManager initialTags={tags} />
    </div>
  )
}
