import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 md:p-8 text-center relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1')}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Home
        </Link>
      </div>

      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/">
            <Image
              src="/branding/logo-vertical.webp"
              alt={APP_CONFIG.name}
              width={140}
              height={140}
              className="h-24 w-auto object-contain mb-2"
              priority
            />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Bem-vindo ao {APP_CONFIG.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Sua central de conexões NFC e avaliações inteligentes.
            </p>
          </div>
        </div>
        <div className="bg-card p-6 md:p-8 rounded-3xl shadow-xl border text-left">
          {children}
        </div>
        <p className="text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/terms" className="underline hover:text-primary">Termos de Uso</Link> e{' '}
          <Link href="/privacy" className="underline hover:text-primary">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  )
}
