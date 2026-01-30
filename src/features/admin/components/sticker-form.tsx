'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Button, Input, Textarea, Select, Badge } from '@/shared/components/ui'
import { ImageUploader } from './image-uploader'
import { createSticker, updateSticker } from '@/features/stickers/actions'
import { slugify } from '@/shared/lib/utils'
import type { StickerWithTags, Tag, BaseType, StickerStatus } from '@/features/stickers/types'

interface StickerFormProps {
  sticker?: StickerWithTags
  tags: Tag[]
}

export function StickerForm({ sticker, tags }: StickerFormProps) {
  const t = useTranslations('admin.stickers')
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    model_number: sticker?.model_number ?? '',
    name_es: sticker?.name_es ?? '',
    name_en: sticker?.name_en ?? '',
    description_es: sticker?.description_es ?? '',
    description_en: sticker?.description_en ?? '',
    slug: sticker?.slug ?? '',
    base_type: (sticker?.base_type ?? 'base_blanca') as BaseType,
    price_ars: sticker?.price_ars ? Number(sticker.price_ars) : 0,
    stock: sticker?.stock ?? 0,
    image_url: sticker?.image_url ?? '',
    image_path: sticker?.image_path ?? '',
    status: (sticker?.status ?? 'draft') as StickerStatus,
    is_featured: sticker?.is_featured ?? false,
    sort_order: sticker?.sort_order ?? 0,
    tag_ids: sticker?.tags.map((tag) => tag.id) ?? [],
  })

  useEffect(() => {
    if (!sticker && form.name_es && !form.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name_es) }))
    }
  }, [form.name_es, form.slug, sticker])

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTag(tagId: string) {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        ...form,
        price_ars: Number(form.price_ars),
        stock: Number(form.stock),
        sort_order: Number(form.sort_order),
        image_url: form.image_url || null,
        image_path: form.image_path || null,
        description_es: form.description_es || null,
        description_en: form.description_en || null,
      }

      const result = sticker
        ? await updateSticker({ ...data, id: sticker.id })
        : await createSticker(data)

      if (result.success) {
        toast.success(t('save'))
        router.push('/admin/stickers')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('model')}
          value={form.model_number}
          onChange={(e) => updateField('model_number', e.target.value)}
          placeholder="#001"
          required
        />
        <Select
          label={t('status')}
          value={form.status}
          onChange={(e) => updateField('status', e.target.value)}
          options={[
            { value: 'draft', label: t('draft') },
            { value: 'active', label: t('active') },
            { value: 'archived', label: t('archived') },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={`${t('name')} (ES)`}
          value={form.name_es}
          onChange={(e) => updateField('name_es', e.target.value)}
          required
        />
        <Input
          label={`${t('name')} (EN)`}
          value={form.name_en}
          onChange={(e) => updateField('name_en', e.target.value)}
          required
        />
      </div>

      <Input
        label="Slug"
        value={form.slug}
        onChange={(e) => updateField('slug', e.target.value)}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          label="Descripcion (ES)"
          value={form.description_es}
          onChange={(e) => updateField('description_es', e.target.value)}
        />
        <Textarea
          label="Description (EN)"
          value={form.description_en}
          onChange={(e) => updateField('description_en', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Base Type"
          value={form.base_type}
          onChange={(e) => updateField('base_type', e.target.value)}
          options={[
            { value: 'base_blanca', label: 'Base Blanca' },
            { value: 'base_holografica', label: 'Base Holografica' },
          ]}
        />
        <Input
          label={t('price')}
          type="number"
          value={String(form.price_ars)}
          onChange={(e) => updateField('price_ars', e.target.value)}
          min="0"
          step="1"
          required
        />
        <Input
          label={t('stock')}
          type="number"
          value={String(form.stock)}
          onChange={(e) => updateField('stock', e.target.value)}
          min="0"
          step="1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Sort Order"
          type="number"
          value={String(form.sort_order)}
          onChange={(e) => updateField('sort_order', e.target.value)}
        />
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
              className="rounded border-border bg-surface text-accent focus:ring-accent"
            />
            <span className="text-sm">{t('featured')}</span>
          </label>
        </div>
      </div>

      <ImageUploader
        modelNumber={form.model_number}
        currentUrl={form.image_url || null}
        onUpload={(url, path) => {
          updateField('image_url', url)
          updateField('image_path', path)
        }}
      />

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
            >
              <Badge
                variant={
                  form.tag_ids.includes(tag.id) ? 'accent' : 'outline'
                }
              >
                {tag.name_es}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {t('save')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          {t('cancel')}
        </Button>
      </div>
    </form>
  )
}
