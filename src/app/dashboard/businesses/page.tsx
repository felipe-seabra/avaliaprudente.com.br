'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/providers/business-provider'
import { CreateBusinessDialog } from '@/components/dashboard/create-business-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, MoreVertical, ExternalLink, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export default function BusinessesPage() {
  const router = useRouter()
  const { businesses, isLoading, setCurrentBusiness } = useBusiness()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas na sua conta.
          </p>
        </div>
        <CreateBusinessDialog />
      </div>

      {businesses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Nenhuma empresa encontrada</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Você ainda não cadastrou nenhuma empresa. Comece criando sua primeira agora mesmo.
          </CardDescription>
          <CreateBusinessDialog>
            <Button className="mt-6">Criar minha primeira empresa</Button>
          </CreateBusinessDialog>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer outline-none">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      render={<Link href={`/dashboard/businesses/${business.id}`} className="flex items-center w-full cursor-pointer" />}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="line-clamp-1">{business.name}</CardTitle>
                <CardDescription className="mt-1">
                  /r/{business.slug}
                </CardDescription>
                <div className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setCurrentBusiness(business)
                      router.push('/dashboard')
                    }}
                  >
                    Gerenciar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="cursor-pointer"
                    render={
                      <Link href={`/r/${business.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
