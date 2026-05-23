import { ShieldCheck, Users, BarChart3, Lock } from 'lucide-react'

export function PlatformPurpose() {
  return (
    <section className="py-24 bg-muted/50 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Transparência e Confiança</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Avalia Prudente é uma plataforma de reputação e gestão de avaliações que ajuda consumidores a compartilhar experiências reais, permitindo que empresas gerenciem e respondam ao feedback dos clientes de forma transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Por que solicitamos login?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para garantir a integridade das avaliações e evitar spam ou avaliações falsas, utilizamos a autenticação do Google e Magic Links. Isso assegura que cada feedback venha de uma pessoa real, protegendo a credibilidade tanto dos consumidores quanto das empresas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Privacidade em primeiro lugar</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados de autenticação são usados estritamente para validar sua identidade. Nunca compartilhamos seu e-mail com as empresas avaliadas nem o exibimos publicamente. Sua privacidade é nossa prioridade absoluta em todo o processo de feedback.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Conectando a Comunidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nossa missão é fortalecer o comércio local de Presidente Prudente e região, criando um canal direto e honesto entre quem compra e quem vende, elevando o padrão de atendimento da nossa cidade.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Gestão Profissional</h3>
              <p className="text-muted-foreground leading-relaxed">
                Oferecemos às empresas ferramentas modernas para monitorar seu desempenho, identificar pontos de melhoria e celebrar conquistas baseadas em dados reais de satisfação do cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
