'use client'

import { useEffect } from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'

export function RootProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  useEffect(() => {
    console.log(`RootProvider: App mounted at ${pathname}`)
  }, [pathname])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </ThemeProvider>
  )
}
