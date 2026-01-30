'use client'

import { useTranslations } from 'next-intl'
import { Store, Layers, Image as ImageIcon } from 'lucide-react'
import { ProposalCard } from './proposal-card'
import { ResellerContactForm } from './reseller-contact-form'

export function ResellerContent() {
  const t = useTranslations('reseller')

  const portabannerItems = [
    t('portabanner.items.banner'),
    t('portabanner.items.stand'),
    t('portabanner.items.folder'),
    t('portabanner.items.whiteModels'),
    t('portabanner.items.holoModels'),
  ]

  const aficheItems = [
    t('afiche.items.poster'),
    t('afiche.items.samples'),
    t('afiche.items.stock'),
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Store className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 text-4xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{t('subtitle')}</p>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Proposals */}
      <div className="grid gap-6 md:grid-cols-2 mb-16">
        <ProposalCard
          icon={<Layers className="h-8 w-8 text-accent" />}
          title={t('portabanner.title')}
          description={t('portabanner.description')}
          items={portabannerItems}
          featured
        />
        <ProposalCard
          icon={<ImageIcon className="h-8 w-8 text-accent" />}
          title={t('afiche.title')}
          description={t('afiche.description')}
          items={aficheItems}
        />
      </div>

      {/* Contact Form */}
      <ResellerContactForm />
    </div>
  )
}
