'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/features/i18n/navigation'
import { Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Dialog } from '@/shared/components/ui'
import { formatPrice } from '@/shared/lib/utils'
import { deleteSticker } from '@/features/stickers/actions'
import type { StickerWithTags } from '@/features/stickers/types'

interface StickerTableProps {
  stickers: StickerWithTags[]
}

export function StickerTable({ stickers }: StickerTableProps) {
  const t = useTranslations('admin.stickers')
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)

    try {
      const result = await deleteSticker(deleteId)
      if (result.success) {
        toast.success('Deleted')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const statusVariant = {
    active: 'success' as const,
    draft: 'warning' as const,
    archived: 'default' as const,
  }

  if (stickers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-foreground">
        No stickers yet
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t('model')}</th>
              <th className="px-4 py-3 font-medium">{t('name')}</th>
              <th className="px-4 py-3 font-medium">{t('status')}</th>
              <th className="px-4 py-3 font-medium">{t('price')}</th>
              <th className="px-4 py-3 font-medium">{t('stock')}</th>
              <th className="px-4 py-3 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stickers.map((sticker) => (
              <tr
                key={sticker.id}
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="px-4 py-3 font-mono text-accent">
                  {sticker.model_number}
                </td>
                <td className="px-4 py-3">{sticker.name_es}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[sticker.status]}>
                    {t(sticker.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {formatPrice(Number(sticker.price_ars))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      sticker.stock < 5 ? 'text-danger font-medium' : ''
                    }
                  >
                    {sticker.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/stickers/${sticker.id}/edit`}>
                      <button className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteId(sticker.id)}
                      className="rounded p-1.5 text-muted-foreground hover:text-danger hover:bg-surface transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t('delete')}
      >
        <p className="mb-4 text-muted-foreground">{t('confirmDelete')}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setDeleteId(null)}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={handleDelete}
          >
            {t('delete')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
