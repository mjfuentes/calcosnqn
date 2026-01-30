import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import { AdminShell } from '@/features/admin/components/admin-shell'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage =
    typeof window === 'undefined'
      ? true // Server-side: allow rendering to check
      : false

  if (!user || user.user_metadata?.role !== 'admin') {
    // Allow login page to render
    if (isLoginPage) {
      return <>{children}</>
    }
    redirect(`/${locale}/admin/login`)
  }

  return <AdminShell>{children}</AdminShell>
}
