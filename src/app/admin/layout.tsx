import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isAdmin = checkIsAdmin(profile?.role)

  if (!isAdmin) {
    console.warn(`AdminLayout [Server]: User ${user.id} is not an admin (role: ${profile?.role}). Redirecting to /dashboard`)
    redirect('/dashboard')
  }

  console.log(`AdminLayout [Server]: Access granted for user ${user.id} (Role: ${profile?.role})`)

  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <TopNav />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="mx-auto w-full max-w-6xl space-y-4">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  )
}
