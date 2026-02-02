'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/features/i18n/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { LanguageToggle } from './language-toggle'
import { MobileMenu } from './mobile-menu'

interface HeaderProps {
  cartCount?: number
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/catalogo' as const, label: t('catalog') },
    { href: '/vende-en-tu-local' as const, label: t('reseller') },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/calcosnqn_header.png"
            alt="CalcosNQN"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          <Link
            href="/carrito"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t('cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </header>
  )
}
