import { BarChart3, Filter, MessageSquare, QrCode, ShieldCheck, Zap } from 'lucide-react'

const features = [
  {
    title: 'Filtro Inteligente',
    description: 'Avaliações de 1 a 3 estrelas são mantidas internas para você resolver o problema antes que se torne público.',
    icon: Filter,
  },
  {
    title: 'Redirecionamento Estratégico',
    description: 'Experiências positivas podem ser redirecionadas para plataformas externas de avaliação, como o Google.',
    icon: Zap,
  },
  {
    title: 'QR Codes Personalizados',
    description: 'Gere QR Codes com a sua marca para colocar em mesas, balcões, embalagens ou cartões de visita.',
    icon: QrCode,
  },
  {
    title: 'Dashboard Analítico',
    description: 'Acompanhe a evolução da sua reputação com gráficos simples e diretos sobre a satisfação dos clientes.',
    icon: BarChart3,
  },
  {
    title: 'Feedback Direto',
    description: 'Receba comentários detalhados dos clientes insatisfeitos para melhorar seu atendimento.',
    icon: MessageSquare,
  },
  {
    title: '100% Seguro',
    description: 'Seus dados e os dados dos seus clientes estão protegidos com as melhores práticas de segurança.',
    icon: ShieldCheck,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Tudo que você precisa para crescer</h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa focada em um único objetivo: melhorar a reputação digital da sua empresa.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-effect rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/5">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
