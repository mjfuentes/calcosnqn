'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import { z } from 'zod/v4'
import { Button, Input, Textarea } from '@/shared/components/ui'
import { WHATSAPP_PHONE } from '@/shared/lib/constants'

const resellerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  business: z.string().min(1, 'Business name is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone is required'),
  message: z.string().optional(),
})

export function ResellerContactForm() {
  const t = useTranslations('reseller.contact')

  const [form, setForm] = useState({
    name: '',
    business: '',
    city: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = resellerFormSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    const lines = [
      `Hola! Quiero vender CalcosNQN en mi local.`,
      ``,
      `Nombre: ${form.name}`,
      `Negocio: ${form.business}`,
      `Ciudad: ${form.city}`,
      `Telefono: ${form.phone}`,
    ]

    if (form.message) {
      lines.push(`Mensaje: ${form.message}`)
    }

    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, '_blank')
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-6 text-xl font-bold">{t('title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label={t('business')}
            placeholder={t('businessPlaceholder')}
            value={form.business}
            onChange={(e) => updateField('business', e.target.value)}
            error={errors.business}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('city')}
            placeholder={t('cityPlaceholder')}
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            error={errors.city}
          />
          <Input
            label={t('phone')}
            placeholder={t('phonePlaceholder')}
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            error={errors.phone}
          />
        </div>
        <Textarea
          label={t('message')}
          placeholder={t('messagePlaceholder')}
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
        />
        <Button type="submit" size="lg">
          <MessageCircle className="h-5 w-5" />
          {t('send')}
        </Button>
      </form>
    </div>
  )
}
