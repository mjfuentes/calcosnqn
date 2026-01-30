'use client'

import { AdminSidebar } from './admin-sidebar'

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}
