'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Ban, Clock, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function BlockedContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const router = useRouter()
  
  const isSuspended = type === 'suspended'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full border-destructive/20 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            {isSuspended ? (
              <Clock className="h-8 w-8 text-destructive" />
            ) : (
              <Ban className="h-8 w-8 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl font-black text-destructive">
            {isSuspended ? 'Conta Suspensa' : 'Acesso Bloqueado'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isSuspended 
              ? 'Sua conta foi temporariamente suspensa por um administrador.' 
              : 'Sua conta foi permanentemente bloqueada por violação dos termos de uso.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4 pb-6 text-sm text-muted-foreground space-y-4">
          <p>
            {isSuspended 
              ? 'Durante este período, você não poderá gerenciar suas empresas ou realizar novas avaliações.'
              : 'Você não tem mais permissão para acessar as áreas restritas da plataforma.'}
          </p>
          <p className="italic">
            Se você acredita que isso é um erro, entre em contato com nosso suporte.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 pt-6">
          <Link href="mailto:suporte@avaliaprudente.com.br" className="w-full">
            <Button variant="outline" className="font-bold w-full">
              Contatar Suporte
            </Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function BlockedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin text-primary border-4 border-t-transparent rounded-full" />
      </div>
    }>
      <BlockedContent />
    </Suspense>
  )
}
