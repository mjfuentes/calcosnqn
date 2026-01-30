import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/shared/lib/supabase/server'
import { AdminShell } from '@/features/admin/components/admin-shell'

interface ProtectedAdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedAdminLayout({
  children,
  params,
}: ProtectedAdminLayoutProps) {
  const { locale } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect(`/${locale}/admin/login`)
  }

  return <AdminShell>{children}</AdminShell>
}
