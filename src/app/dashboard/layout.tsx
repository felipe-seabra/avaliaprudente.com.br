import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { BusinessProvider } from '@/providers/business-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="mx-auto w-full max-w-6xl space-y-4">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BusinessProvider>
  )
}
