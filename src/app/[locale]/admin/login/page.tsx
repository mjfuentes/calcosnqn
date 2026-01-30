'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/shared/lib/supabase/client'
import { Button, Input } from '@/shared/components/ui'
import { SITE_NAME } from '@/shared/lib/constants'

export default function AdminLoginPage() {
  const t = useTranslations('admin.login')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(t('error'))
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-accent font-mono">
            {SITE_NAME}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {t('submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
