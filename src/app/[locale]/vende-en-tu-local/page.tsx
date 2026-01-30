import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ResellerContent } from '@/features/reseller/components/reseller-content'

interface ResellerPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ResellerPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'reseller' })

  return {
    title: t('title'),
  }
}

export default async function ResellerPage({ params }: ResellerPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ResellerContent />
}
