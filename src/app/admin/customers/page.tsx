import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users as UsersIcon } from 'lucide-react'

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Gerencie todos os usuários da plataforma.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <CardTitle>Lista de Clientes</CardTitle>
          </div>
          <CardDescription>Visualização em tempo real de novos registros.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
             <p>A funcionalidade de listagem de clientes está sendo preparada.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
