'use client'

import { Header } from '@/shared/components/layout/header'
import { Footer } from '@/shared/components/layout/footer'
import { useCartStore } from '@/features/cart/store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const cartCount = useCartStore((state) => state.totalItems())

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
