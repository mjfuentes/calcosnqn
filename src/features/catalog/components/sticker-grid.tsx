import type { StickerWithTags } from '@/features/stickers/types'
import { StickerCard } from './sticker-card'

interface StickerGridProps {
  stickers: StickerWithTags[]
}

export function StickerGrid({ stickers }: StickerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stickers.map((sticker) => (
        <StickerCard key={sticker.id} sticker={sticker} />
      ))}
    </div>
  )
}
