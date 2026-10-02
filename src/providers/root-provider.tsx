'use client'

import { useState } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient as defaultQueryClient } from '@/lib/query-client'
import { SubscriptionProvider } from './subscription-provider'

const PRIVATE_ROUTE_PATTERN = /^\/(dashboard|admin|account|onboarding)(\/|$)/

export function RootProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [queryClient] = useState(() => defaultQueryClient)
  const isPrivateRoute = PRIVATE_ROUTE_PATTERN.test(pathname)

  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {isPrivateRoute ? (
          <SubscriptionProvider>{children}</SubscriptionProvider>
        ) : (
          children
        )}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </ThemeProvider>
  )

  if (!isPrivateRoute) {
    return content
  }

  return (
    <QueryClientProvider client={queryClient}>
      {content}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
