'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Upload, X, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/shared/lib/utils'

interface ImageUploaderProps {
  modelNumber: string
  currentUrl: string | null
  onUpload: (url: string, path: string) => void
}

export function ImageUploader({
  modelNumber,
  currentUrl,
  onUpload,
}: ImageUploaderProps) {
  const t = useTranslations('admin.stickers')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large (max 5MB)')
        return
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, PNG, WebP allowed')
        return
      }

      setPreview(URL.createObjectURL(file))
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('model_number', modelNumber)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const json = await res.json()

        if (json.success) {
          onUpload(json.data.image_url, json.data.image_path)
          toast.success('Image uploaded')
        } else {
          toast.error(json.error ?? 'Upload failed')
          setPreview(currentUrl)
        }
      } catch {
        toast.error('Upload failed')
        setPreview(currentUrl)
      } finally {
        setUploading(false)
      }
    },
    [modelNumber, currentUrl, onUpload]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t('image')}
      </label>

      {preview ? (
        <div className="relative aspect-square w-48 overflow-hidden rounded-lg border border-border">
          <Image
            src={preview}
            alt="Preview"
            fill
            sizes="192px"
            className="object-cover"
          />
          <button
            onClick={() => {
              setPreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex aspect-square w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
            dragOver
              ? 'border-accent bg-accent-muted'
              : 'border-border hover:border-border-hover'
          )}
        >
          {dragOver ? (
            <Upload className="h-8 w-8 text-accent" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted" />
          )}
          <p className="text-xs text-muted-foreground">
            {t('dragOrClick')}
          </p>
          <p className="text-xs text-muted">{t('maxSize')}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
