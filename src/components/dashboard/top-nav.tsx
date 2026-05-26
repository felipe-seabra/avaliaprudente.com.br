'use client'

import { ThemeToggle } from '@/components/shared/theme-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import React from 'react'
import { NotificationBell } from './notification-bell'
import { ModerationStatusBadge } from './moderation-status-badge'
import { PlanBadge } from './plan-badge'

export function TopNav() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {paths.map((path, index) => {
              const isLast = index === paths.length - 1
              const title = path.charAt(0).toUpperCase() + path.slice(1)
              const href = `/${paths.slice(0, index + 1).join('/')}`

              return (
                <React.Fragment key={path}>
                  <BreadcrumbItem className="hidden md:block">
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="cursor-pointer">
                        {title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-4 flex items-center gap-4">
        <PlanBadge />
        <ModerationStatusBadge />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
