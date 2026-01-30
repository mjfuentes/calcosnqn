import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/features/i18n/routing'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import { ClientLayout } from './client-layout'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientLayout>
        {children}
      </ClientLayout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#141414',
            color: '#ededed',
            border: '1px solid #2a2a2a',
          },
        }}
      />
    </NextIntlClientProvider>
  )
}
