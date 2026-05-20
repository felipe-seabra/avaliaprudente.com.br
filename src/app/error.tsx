'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-muted/30">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Algo deu errado!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Pedimos desculpas pelo inconveniente. Um erro inesperado ocorreu. Nossa equipe já foi notificada.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Tentar novamente
        </Button>
        <Button render={<Link href="/" />} nativeButton={false}>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
