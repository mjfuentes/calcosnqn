'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Button, Badge } from '@/shared/components/ui'
import { updateStock } from '@/features/stickers/actions'
import type { StickerWithTags } from '@/features/stickers/types'

interface StockManagerProps {
  stickers: StickerWithTags[]
}

export function StockManager({ stickers }: StockManagerProps) {
  const t = useTranslations('admin.stock')
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [stockValues, setStockValues] = useState<Record<string, number>>(
    Object.fromEntries(stickers.map((s) => [s.id, s.stock]))
  )

  const hasChanges = stickers.some(
    (s) => stockValues[s.id] !== s.stock
  )

  function updateValue(id: string, value: number) {
    setStockValues((prev) => ({ ...prev, [id]: Math.max(0, value) }))
  }

  async function handleSave() {
    setSaving(true)

    const updates = stickers
      .filter((s) => stockValues[s.id] !== s.stock)
      .map((s) => ({ id: s.id, stock: stockValues[s.id] }))

    if (updates.length === 0) return

    try {
      const result = await updateStock(updates)
      if (result.success) {
        toast.success(t('saved'))
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed')
      }
    } catch {
      toast.error('Failed to update stock')
    } finally {
      setSaving(false)
    }
  }

  if (stickers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted-foreground">
        No stickers yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-32">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stickers.map((sticker) => {
              const value = stockValues[sticker.id]
              const changed = value !== sticker.stock

              return (
                <tr
                  key={sticker.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-accent">
                    {sticker.model_number}
                  </td>
                  <td className="px-4 py-3">{sticker.name_es}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        sticker.status === 'active' ? 'success' : 'warning'
                      }
                    >
                      {sticker.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) =>
                        updateValue(sticker.id, Number(e.target.value))
                      }
                      className={`w-20 rounded border px-2 py-1 text-sm bg-background ${
                        changed
                          ? 'border-accent text-accent font-medium'
                          : 'border-border text-foreground'
                      }`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            {t('update')}
          </Button>
        </div>
      )}
    </div>
  )
}
