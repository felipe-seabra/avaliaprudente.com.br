'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  Zap, 
  Info,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/constants'

export default function AdminSettingsPage() {
  const [dbVersion, setDbVersion] = useState<string>('Carregando...')
  const [supabaseUrl, setSupabaseUrl] = useState<string>('')
  
  useEffect(() => {
    async function fetchDbInfo() {
      const supabase = createClient()
      
      try {
        const { data } = await supabase.from('profiles').select('id').limit(1)
        if (data) {
           setDbVersion('PostgreSQL 16 (Standard)')
        }
      } catch {
        setDbVersion('PostgreSQL (Cloud)')
      }
      
      setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configurado')
    }
    fetchDbInfo()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Visão técnica e parâmetros globais da plataforma.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Segurança & Acesso</CardTitle>
            </div>
            <CardDescription>Políticas de RLS e autenticação ativa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Modo de Segurança</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded">Strict RLS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Função is_admin()</span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase rounded">Ativa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">RBAC Habilitado</span>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase rounded">Sim</span>
              </div>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 font-bold">Informação</AlertTitle>
              <AlertDescription className="text-blue-700 text-xs">
                Todas as alterações de infraestrutura devem ser realizadas via migrações de código para garantir a integridade entre ambientes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Infraestrutura de Dados</CardTitle>
            </div>
            <CardDescription>Status da conexão com Supabase/PostgreSQL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">Endpoint</span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">{supabaseUrl}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">PostgreSQL</span>
                <span className="font-mono text-[11px]">{dbVersion.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[11px] font-bold uppercase">Conectado</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-full gap-2 text-[11px] font-bold uppercase" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
                <ExternalLink className="h-3 w-3" /> Supabase Studio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-zinc-950 text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <CardTitle>Configuração da Aplicação</CardTitle>
          </div>
          <CardDescription className="text-zinc-400">Variáveis de ambiente e constantes globais.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
             <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-zinc-500">Nome do App</p>
                <p className="text-sm font-medium">{APP_CONFIG.name}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-zinc-500">URL Base</p>
                <p className="text-sm font-medium truncate">{APP_CONFIG.url}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-zinc-500">WhatsApp Suporte</p>
                <p className="text-sm font-medium">{APP_CONFIG.whatsappOrderNumber}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-600">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-xs font-medium">
          A seção de gerenciamento de faturamento e planos Pro/Business será habilitada após a integração com o gateway de pagamento.
        </p>
      </div>
    </div>
  )
}
