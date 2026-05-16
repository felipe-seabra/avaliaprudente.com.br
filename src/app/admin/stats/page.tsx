import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AdminStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estatísticas Globais</h1>
        <p className="text-muted-foreground">Métricas consolidadas de toda a rede Avalia Prudente.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Indicadores de Desempenho</CardTitle>
          </div>
          <CardDescription>KPIs, churn e engajamento global.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
             <p>O painel de estatísticas avançadas está em desenvolvimento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
