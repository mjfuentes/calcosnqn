'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'
import { Button, Input } from '@/shared/components/ui'
import { useCartStore } from '../store'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../utils'
import type { Locale } from '@/features/i18n/config'

export function WhatsAppCheckoutButton() {
  const locale = useLocale() as Locale
  const t = useTranslations('cart')
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')

  function handleCheckout() {
    const message = buildWhatsAppMessage(items, locale, {
      name: name || undefined,
      city: city || undefined,
    })
    const url = buildWhatsAppUrl(message)

    window.open(url, '_blank')
    clearCart()
    setShowForm(false)
    setName('')
    setCity('')
    toast.success(t('cleared'))
  }

  if (!showForm) {
    return (
      <Button
        size="lg"
        className="w-full"
        onClick={() => setShowForm(true)}
      >
        <MessageCircle className="h-5 w-5" />
        {t('checkout')}
      </Button>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <Input
        label={t('checkoutForm.name')}
        placeholder={t('checkoutForm.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label={t('checkoutForm.city')}
        placeholder={t('checkoutForm.cityPlaceholder')}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowForm(false)}
          className="flex-1"
        >
          {t('quantity')}
        </Button>
        <Button onClick={handleCheckout} className="flex-1">
          <MessageCircle className="h-4 w-4" />
          {t('checkout')}
        </Button>
      </div>
    </div>
  )
}
