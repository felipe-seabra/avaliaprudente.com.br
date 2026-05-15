'use client'

import * as React from 'react'
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  QrCode,
  Settings,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { APP_CONFIG } from '@/lib/constants'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { UserNav } from './user-nav'
import { BusinessSwitcher } from './business-switcher'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Empresas',
      url: '/dashboard/businesses',
      icon: Building2,
    },
    {
      title: 'Avaliações',
      url: '/dashboard/reviews',
      icon: Star,
    },
    {
      title: 'QR Codes',
      url: '/dashboard/qr-codes',
      icon: QrCode,
    },
    {
      title: 'Analytics',
      url: '/dashboard/analytics',
      icon: BarChart3,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Star className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {APP_CONFIG.name}
                </span>
                <span className="truncate text-xs">Gestão</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <BusinessSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                tooltip={item.title}
                isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem className="mt-auto">
            <SidebarMenuButton
              render={<Link href="/dashboard/settings" />}
              tooltip="Configurações"
              isActive={pathname.startsWith('/dashboard/settings')}
            >
              <Settings />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 flex justify-center w-full">
          <UserNav />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
