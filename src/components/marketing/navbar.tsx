'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { APP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { UserMenu } from '@/components/shared/user-menu'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    { href: '/#features', label: 'Recursos' },
    { href: '/#how-it-works', label: 'Como Funciona' },
    { href: '/#pricing', label: 'Preços' },
  ]

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
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Button variant="ghost" className="cursor-pointer" render={<Link href="/login" />} nativeButton={false}>
                  Entrar
                </Button>
                <Button className="cursor-pointer" render={<Link href="/register" />} nativeButton={false}>
                  Começar grátis
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            {user && <UserMenu user={user} />}
            <Sheet>
              <SheetTrigger 
                render={
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left pb-6 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  {!user && (
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" className="w-full cursor-pointer" render={<Link href="/login" />} nativeButton={false}>
                        Entrar
                      </Button>
                      <Button className="w-full cursor-pointer" render={<Link href="/register" />} nativeButton={false}>
                        Começar grátis
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
