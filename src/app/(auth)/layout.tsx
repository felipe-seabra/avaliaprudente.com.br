import React from 'react'
import Link from 'next/link'
import { APP_CONFIG } from '@/lib/constants'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4 md:p-8">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-primary transition-colors hover:text-primary/80"
          >
            {APP_CONFIG.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {APP_CONFIG.description}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
