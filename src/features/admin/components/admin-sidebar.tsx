'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/features/i18n/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import {
  LayoutDashboard,
  Sticker,
  Tags,
  Package,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/stickers', icon: Sticker, key: 'stickers' },
  { href: '/admin/tags', icon: Tags, key: 'tags' },
  { href: '/admin/stock', icon: Package, key: 'stock' },
] as const

export function AdminSidebar() {
  const t = useTranslations('admin.sidebar')
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
      <nav className="flex h-full flex-col p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-black font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto space-y-1 pt-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSite')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </button>
        </div>
      </nav>
    </aside>
  )
}
