'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { APP_CONFIG } from '@/lib/constants'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-xl text-gradient">
            {APP_CONFIG.name}
          </span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Preços
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Começar grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
