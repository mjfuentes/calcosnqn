'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus, Edit, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Dialog } from '@/shared/components/ui'
import { createTag, updateTag, deleteTag } from '@/features/stickers/actions'
import { slugify } from '@/shared/lib/utils'
import type { Tag } from '@/features/stickers/types'

interface TagManagerProps {
  initialTags: Tag[]
}

export function TagManager({ initialTags }: TagManagerProps) {
  const t = useTranslations('admin.tags')
  const router = useRouter()

  const [tags, setTags] = useState(initialTags)
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name_es: '', name_en: '', slug: '' })

  function resetForm() {
    setForm({ name_es: '', name_en: '', slug: '' })
    setShowNew(false)
    setEditingId(null)
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setForm({ name_es: tag.name_es, name_en: tag.name_en, slug: tag.slug })
    setShowNew(false)
  }

  function startNew() {
    setShowNew(true)
    setEditingId(null)
    setForm({ name_es: '', name_en: '', slug: '' })
  }

  async function handleSave() {
    setSaving(true)

    try {
      const data = {
        ...form,
        slug: form.slug || slugify(form.name_es),
      }

      if (editingId) {
        const result = await updateTag({ ...data, id: editingId })
        if (result.success && result.data) {
          setTags((prev) =>
            prev.map((tag) => (tag.id === editingId ? result.data! : tag))
          )
          toast.success('Saved')
        } else {
          toast.error(result.error ?? 'Failed')
        }
      } else {
        const result = await createTag(data)
        if (result.success && result.data) {
          setTags((prev) => [...prev, result.data!])
          toast.success('Created')
        } else {
          toast.error(result.error ?? 'Failed')
        }
      }

      resetForm()
      router.refresh()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setSaving(true)

    try {
      const result = await deleteTag(deleteId)
      if (result.success) {
        setTags((prev) => prev.filter((tag) => tag.id !== deleteId))
        toast.success('Deleted')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed')
      }
    } catch {
      toast.error('Failed to delete')
    } finally {
      setSaving(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="space-y-2">
        {/* New tag button */}
        {!showNew && (
          <Button onClick={startNew} variant="outline" className="mb-4">
            <Plus className="h-4 w-4" />
            {t('new')}
          </Button>
        )}

        {/* New tag form */}
        {showNew && (
          <div className="flex items-end gap-3 rounded-lg border border-accent bg-surface p-4 mb-4">
            <Input
              label="ES"
              value={form.name_es}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name_es: e.target.value }))
              }
              placeholder="Nombre"
            />
            <Input
              label="EN"
              value={form.name_en}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name_en: e.target.value }))
              }
              placeholder="Name"
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="auto"
            />
            <div className="flex gap-1 pb-0.5">
              <Button onClick={handleSave} loading={saving} size="sm">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={resetForm} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tag list */}
        <div className="rounded-lg border border-border overflow-hidden">
          {tags.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No tags yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">ES</th>
                  <th className="px-4 py-3 font-medium">EN</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    {editingId === tag.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={form.name_es}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                name_es: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={form.name_en}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                name_en: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={form.slug}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                slug: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={handleSave}
                              className="rounded p-1.5 text-success hover:bg-surface-hover"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={resetForm}
                              className="rounded p-1.5 text-muted hover:bg-surface-hover"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{tag.name_es}</td>
                        <td className="px-4 py-3">{tag.name_en}</td>
                        <td className="px-4 py-3 text-muted font-mono text-xs">
                          {tag.slug}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(tag)}
                              className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(tag.id)}
                              className="rounded p-1.5 text-muted-foreground hover:text-danger hover:bg-surface-hover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t('delete')}
      >
        <p className="mb-4 text-muted-foreground">{t('confirmDelete')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" loading={saving} onClick={handleDelete}>
            {t('delete')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
