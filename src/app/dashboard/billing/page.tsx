import { Metadata } from 'next'
import { getSubscriptionPlans } from '@/app/actions/subscriptions'
import { getUserSubscription } from '@/lib/subscriptions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config'

export const metadata: Metadata = {
  title: 'Faturamento e Planos | Avalia Prudente',
  description: 'Gerencie sua assinatura e escolha o melhor plano para o seu negócio.',
}

export default async function BillingPage() {
  const plans = await getSubscriptionPlans()
  const result = await getUserSubscription()
  const subscription = result?.subscription
  const isSuperAdmin = result?.isSuperAdmin

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturamento e Planos</h1>
          <p className="text-muted-foreground">
            Escolha o plano ideal para potencializar a reputação do seu negócio.
          </p>
        </div>
        {isSuperAdmin && (
          <Badge variant="secondary" className="h-8 gap-1.5 px-4 font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Super Admin (Ilimitado)
          </Badge>
        )}
      </div>

      {isSuperAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Modo Operador Plataforma</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              Como Super Administrador, você possui acesso **ilimitado** a todos os recursos e não está sujeito a quotas comerciais.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = !isSuperAdmin && subscription?.plan_id === plan.id
          const config = SUBSCRIPTION_PLANS[plan.slug]
          
          return (
            <Card key={plan.id} className={`flex flex-col transition-all duration-300 ${isCurrentPlan ? 'border-primary shadow-lg ring-1 ring-primary scale-[1.02]' : 'hover:border-primary/30'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Atual
                    </Badge>
                  )}
                </div>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="text-2xl font-bold">
                  {plan.slug === 'free' ? 'Grátis' : (
                    config ? `R$ ${config.price.toFixed(2).replace('.', ',')}/mês` : 'Em Breve'
                  )}
                </div>
                
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Cotas</p>
                  {Object.entries(plan.quotas as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full font-bold" 
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || (plan.slug !== 'free' && !isSuperAdmin)}
                >
                  {isCurrentPlan ? 'Plano Atual' : (isSuperAdmin ? 'Incluído para Admin' : (plan.slug === 'free' ? 'Selecionar' : 'Em Breve'))}
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
