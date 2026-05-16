import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BusinessNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-muted/30">
      <div className="h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-yellow-600" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Página Indisponível</h1>
      <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
        Não conseguimos encontrar esta página. Verifique o link ou aproxime o celular novamente.
      </p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full cursor-pointer">
            Tentar Novamente
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button variant="ghost" className="w-full cursor-pointer">
            Ir para o Site Oficial
          </Button>
        </Link>
      </div>
    </div>
  )
}
