'use client'

import * as React from 'react'
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  QrCode,
  Settings,
  Star,
  ShieldAlert,
  ExternalLink,
  ShoppingBag,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PlanBadge } from './plan-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Página Pública',
      url: '/dashboard/page-editor',
      icon: ExternalLink,
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
    {
      title: 'Transparência',
      url: '/dashboard/moderation',
      icon: ShieldAlert,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [supabase])

  const orderUrl = `https://wa.me/${APP_CONFIG.whatsappOrderNumber}?text=${encodeURIComponent('Olá! Gostaria de comprar minha Tag NFC da Avalia Prudente no valor de R$ 69,90.')}`

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" className="cursor-pointer transition-opacity hover:opacity-90" />}>
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                  <Star className="size-4 fill-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <Image
                    src="/branding/logo-horizontal.webp"
                    alt={APP_CONFIG.name}
                    width={140}
                    height={32}
                    sizes="140px"
                    className="h-6 w-auto object-contain"
                  />
                </div>
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
                render={<Link href={item.url} className="cursor-pointer" />}
                tooltip={item.title}
                isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/admin/dashboard" className="cursor-pointer" />}
                tooltip="Painel Admin"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
              >
                <ShieldAlert className="animate-pulse" />
                <span>Painel Admin</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem className="mt-auto">
            <SidebarMenuButton
              render={<Link href="/dashboard/settings" className="cursor-pointer" />}
              tooltip="Configurações"
              isActive={pathname.startsWith('/dashboard/settings')}
            >
              <Settings />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          </SidebarMenu>

          {/* Plan Section */}
          <div className="mt-auto px-4 py-2 group-data-[collapsible=icon]:hidden">
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-3">
             <div className="flex items-center justify-between">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Seu Plano</p>
               <PlanBadge showIcon={false} className="px-2 py-0 h-4" />
             </div>
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger render={
                   <div className="w-full">
                     <Button 
                       size="sm" 
                       variant="outline"
                       className="w-full h-8 text-[11px] font-bold gap-2 opacity-60 cursor-not-allowed"
                       disabled
                     >
                        <Zap className="h-3 w-3 fill-primary text-primary" />
                        Fazer Upgrade
                     </Button>
                   </div>
                 } />
                 <TooltipContent side="top">
                   <p className="text-xs font-medium">Planos Pro & Enterprise em breve!</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
          </div>
          </div>

          {/* Growth CTA */}
          <div className="px-4 py-4 group-data-[collapsible=icon]:hidden">

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 pointer-events-none">
                <ShoppingBag className="h-12 w-12" />
             </div>
             <p className="text-xs font-bold text-primary uppercase tracking-widest">NFC Experience</p>
             <p className="text-[11px] text-muted-foreground leading-relaxed">
               Potencialize suas avaliações com tags físicas inteligentes.
             </p>
             <Button 
               size="sm" 
               className="w-full h-8 text-[11px] font-bold gap-2 cursor-pointer shadow-sm shadow-primary/20"
               onClick={() => window.open(orderUrl, '_blank')}
             >
                <ShoppingBag className="h-3 w-3" />
                Comprar Tag NFC
             </Button>
          </div>
        </div>
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
