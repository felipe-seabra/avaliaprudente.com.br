import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Parâmetros globais e manutenção da plataforma.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <CardTitle>Controle Administrativo</CardTitle>
          </div>
          <CardDescription>Gerenciamento de limites, planos e APIs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
             <p>As configurações administrativas estão protegidas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
