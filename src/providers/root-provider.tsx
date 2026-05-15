'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function RootProvider({ children }: { children: React.ReactNode }) {
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
