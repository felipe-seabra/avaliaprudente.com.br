'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { APP_CONFIG } from '@/lib/constants'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90">
          <Image
            src="/branding/logo-horizontal.webp"
            alt={APP_CONFIG.name}
            width={180}
            height={40}
            sizes="180px"
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Recursos
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Como Funciona
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Preços
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" className="hidden md:flex cursor-pointer" render={<Link href="/login" />} nativeButton={false}>
            Entrar
          </Button>
          <Button className="cursor-pointer" render={<Link href="/register" />} nativeButton={false}>
            Começar grátis
          </Button>
        </div>
      </div>
    </header>
  )
}
