'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/shared/components/ui'
import { useCartStore } from '@/features/cart/store'
import type { StickerWithTags } from '@/features/stickers/types'

interface AddToCartButtonProps {
  sticker: StickerWithTags
  size?: 'md' | 'lg'
}

export function AddToCartButton({ sticker, size = 'md' }: AddToCartButtonProps) {
  const t = useTranslations('sticker')
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  if (sticker.stock === 0) {
    return (
      <Button disabled size={size} variant="secondary">
        {t('outOfStock')}
      </Button>
    )
  }

  function handleAdd() {
    addItem({
      id: sticker.id,
      model_number: sticker.model_number,
      name_es: sticker.name_es,
      name_en: sticker.name_en,
      slug: sticker.slug,
      base_type: sticker.base_type,
      price_ars: Number(sticker.price_ars),
      image_url: sticker.image_url,
      max_stock: sticker.stock,
    })
    setAdded(true)
    toast.success(t('added'))
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button onClick={handleAdd} size={size}>
      {added ? (
        <>
          <Check className="h-4 w-4" />
          {t('added')}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {t('addToCart')}
        </>
      )}
    </Button>
  )
}
