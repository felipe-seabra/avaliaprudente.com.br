import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default function AdminBusinessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">Monitore todos os estabelecimentos cadastrados.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Diretório de Empresas</CardTitle>
          </div>
          <CardDescription>Acompanhe o crescimento e uso por estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
             <p>A funcionalidade de monitoramento de empresas está sendo preparada.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
