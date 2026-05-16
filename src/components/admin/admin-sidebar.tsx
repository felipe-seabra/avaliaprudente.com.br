'use client'

import * as React from 'react'
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  ShieldAlert,
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
import { UserNav } from '@/components/dashboard/user-nav'

const data = {
  navMain: [
    {
      title: 'Visão Geral',
      url: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Clientes',
      url: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Empresas',
      url: '/admin/businesses',
      icon: Building2,
    },
    {
      title: 'Estatísticas',
      url: '/admin/stats',
      icon: BarChart3,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                <ShieldAlert className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {APP_CONFIG.name}
                </span>
                <span className="truncate text-xs">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
              render={<Link href="/admin/settings" />}
              tooltip="Configurações"
              isActive={pathname.startsWith('/admin/settings')}
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
