import type { CartItem } from './types'
import type { Locale } from '@/features/i18n/config'
import { WHATSAPP_PHONE, BASE_TYPE_LABELS } from '@/shared/lib/constants'
import { formatPrice, getLocalizedName } from '@/shared/lib/utils'

interface CheckoutInfo {
  name?: string
  city?: string
}

export function buildWhatsAppMessage(
  items: CartItem[],
  locale: Locale,
  info?: CheckoutInfo
): string {
  const isEs = locale === 'es'

  const header = isEs
    ? 'Hola! Quiero hacer un pedido:'
    : 'Hi! I would like to place an order:'

  const itemLines = items.map((item) => {
    const name = getLocalizedName(item, locale)
    const baseLabel = BASE_TYPE_LABELS[locale][item.base_type]
    const subtotal = formatPrice(item.price_ars * item.quantity)
    return `- ${item.model_number} ${name} (${baseLabel}) x${item.quantity} = ${subtotal}`
  })

  const total = items.reduce(
    (sum, item) => sum + item.price_ars * item.quantity,
    0
  )

  const totalLabel = isEs ? 'Total' : 'Total'
  const totalLine = `*${totalLabel}: ${formatPrice(total)}*`

  const parts = [header, '', ...itemLines, '', totalLine]

  if (info?.name) {
    const label = isEs ? 'Nombre' : 'Name'
    parts.push('', `${label}: ${info.name}`)
  }

  if (info?.city) {
    const label = isEs ? 'Ciudad' : 'City'
    parts.push(`${label}: ${info.city}`)
  }

  return parts.join('\n')
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
