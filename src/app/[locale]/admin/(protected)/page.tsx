import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getDashboardStats } from '@/features/stickers/admin-queries'
import { Card, CardContent } from '@/shared/components/ui'
import { Sticker, Eye, FileEdit, AlertTriangle } from 'lucide-react'

interface AdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' })

  let stats = { total: 0, active: 0, draft: 0, lowStock: 0 }
  try {
    stats = await getDashboardStats()
  } catch {
    // DB might not be ready
  }

  const cards = [
    {
      label: t('totalStickers'),
      value: stats.total,
      icon: Sticker,
      color: 'text-foreground',
    },
    {
      label: t('activeStickers'),
      value: stats.active,
      icon: Eye,
      color: 'text-success',
    },
    {
      label: t('draftStickers'),
      value: stats.draft,
      icon: FileEdit,
      color: 'text-warning',
    },
    {
      label: t('lowStock'),
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'text-danger',
      subtitle: t('lowStockAlert'),
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${card.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    {card.subtitle && (
                      <p className="text-xs text-muted">{card.subtitle}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
