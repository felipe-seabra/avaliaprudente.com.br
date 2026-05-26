import { Metadata } from 'next'
import { getSubscriptionPlans } from '@/app/actions/subscriptions'
import { getUserSubscription } from '@/lib/subscriptions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Faturamento e Planos | Avalia Prudente',
  description: 'Gerencie sua assinatura e escolha o melhor plano para o seu negócio.',
}

export default async function BillingPage() {
  const plans = await getSubscriptionPlans()
  const subscription = await getUserSubscription()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faturamento e Planos</h1>
        <p className="text-muted-foreground">
          Escolha o plano ideal para potencializar a reputação do seu negócio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id
          
          return (
            <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Atual
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="text-2xl font-bold">
                  {plan.slug === 'free' ? 'Grátis' : 'Em Breve'}
                </div>
                
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Cotas</p>
                  {Object.entries(plan.quotas as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || plan.slug !== 'free'}
                >
                  {isCurrentPlan ? 'Plano Atual' : (plan.slug === 'free' ? 'Selecionar' : 'Em Breve')}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-primary text-primary" />
            Precisa de um plano customizado?
          </CardTitle>
          <CardDescription>
            Para redes de franquias ou grandes volumes, entre em contato conosco para uma solução sob medida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Falar com Consultor</Button>
        </CardContent>
      </Card>
    </div>
  )
}
