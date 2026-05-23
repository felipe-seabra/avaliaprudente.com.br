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
              Avalia Prudente is a business reviews and digital reputation platform that helps consumers share real experiences while allowing businesses to manage and respond to customer feedback.
              <br />
              <span className="text-sm opacity-70">
                O Avalia Prudente é uma plataforma de reputação empresarial e avaliações online que ajuda consumidores a compartilhar experiências reais.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
