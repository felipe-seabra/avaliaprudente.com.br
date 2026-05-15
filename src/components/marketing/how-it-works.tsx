import { ArrowRight, QrCode, Smartphone, Star } from 'lucide-react'

const steps = [
  {
    id: '01',
    title: 'O cliente escaneia o QR Code',
    description: 'Após o atendimento ou compra, o cliente escaneia o QR Code na mesa ou balcão.',
    icon: Smartphone,
  },
  {
    id: '02',
    title: 'Deixa uma nota de 1 a 5',
    description: 'Abre uma tela simples e rápida com a sua identidade visual para ele dar a nota.',
    icon: Star,
  },
  {
    id: '03',
    title: 'Filtro em ação',
    description: 'Se for 4 ou 5 estrelas, ele é levado ao Google. Se for 1 a 3, o feedback vai só para você.',
    icon: ArrowRight,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Como funciona?</h2>
          <p className="text-lg text-muted-foreground">
            Três passos simples para multiplicar suas avaliações positivas e conter as negativas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-sm">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">
                PASSO {step.id}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 glass-effect rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto flex flex-col items-center">
          <QrCode className="h-16 w-16 text-primary mb-6" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Teste você mesmo</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            Escaneie ou clique no botão abaixo para ver a experiência exata que o seu cliente terá.
          </p>
        </div>
      </div>
    </section>
  )
}
