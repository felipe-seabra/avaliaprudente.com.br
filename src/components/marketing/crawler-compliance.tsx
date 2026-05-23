import { ShieldCheck } from 'lucide-react'

export function CrawlerComplianceSection() {
  return (
    <section className="bg-primary/5 py-12 border-y border-primary/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
          <div className="bg-background p-4 rounded-2xl shadow-sm border border-primary/10 shrink-0">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Sobre o Avalia Prudente</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong>Avalia Prudente</strong> é uma plataforma de reputação empresarial e avaliações online que permite que consumidores compartilhem experiências reais e que empresas gerenciem e respondam aos feedbacks de clientes de forma transparente e segura.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
