'use client'

import * as React from 'react'
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  ShieldAlert,
  Shield,
  ArrowLeft,
  MessageSquare,
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
import { createClient } from '@/lib/supabase/client'

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
      title: 'Verificações',
      url: '/admin/verifications',
      icon: ShieldAlert,
    },
    {
      title: 'Apelações',
      url: '/admin/appeals',
      icon: MessageSquare,
    },
    {
      title: 'Estatísticas',
      url: '/admin/stats',
      icon: BarChart3,
    },
    {
      title: 'Segurança',
      url: '/admin/security',
      icon: Shield,
      superAdminOnly: true,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [role, setRole] = React.useState<string>('admin')

  const filteredNavMain = data.navMain.filter(item => {
    if (item.superAdminOnly) {
      return role === 'super_admin'
    }
    return true
  })

  React.useEffect(() => {
    async function getRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role) {
          setRole(profile.role)
        }
      }
    }
    getRole()
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin/dashboard" className="cursor-pointer" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shrink-0 shadow-lg shadow-destructive/20">
                <ShieldAlert className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold">
                  {APP_CONFIG.name}
                </span>
                <span className="truncate text-xs opacity-70 uppercase tracking-widest font-bold">
                  {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard Escape Route */}
          <SidebarMenuItem className="mb-4 px-2">
            <SidebarMenuButton
              render={<Link href="/dashboard" className="cursor-pointer" />}
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 hover:text-primary text-primary font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground opacity-50 group-data-[collapsible=icon]:hidden">
            Administração
          </div>

          {filteredNavMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} className="cursor-pointer" />}
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
              render={<Link href="/admin/settings" className="cursor-pointer" />}
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
