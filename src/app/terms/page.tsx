import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Leia os termos e condições de uso da plataforma SaaS e dos produtos NFC da Avalia Prudente.',
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl bg-card p-8 md:p-12 rounded-3xl shadow-xl border-none">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-gradient">Termos de Uso</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <p>Última atualização: 16 de maio de 2026</p>
              <p>
                Bem-vindo ao <strong>Avalia Prudente</strong>. Ao acessar nossa plataforma ou adquirir nossos produtos físicos (Tags NFC), você concorda em cumprir e estar vinculado aos seguintes Termos de Uso.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">1. Objeto do Serviço</h2>
              <p className="text-muted-foreground">
                O Avalia Prudente é uma plataforma SaaS (Software as a Service) que permite a criação de páginas públicas modulares acessíveis via NFC ou QR Code, com foco em gestão de avaliações e conexões digitais para negócios locais.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">2. Uso do Produto Físico (NFC)</h2>
              <p className="text-muted-foreground">
                As tags NFC fornecidas são de propriedade do comprador após a confirmação da assinatura/pagamento. A Avalia Prudente garante a funcionalidade do chip NFC e a durabilidade do material em condições normais de uso. Danos causados por mau uso, exposição a calor excessivo ou produtos químicos são de responsabilidade do cliente.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">3. Responsabilidades do Cliente</h2>
              <p className="text-muted-foreground">
                Ao utilizar a plataforma, você se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fornecer informações verdadeiras e atualizadas.</li>
                <li>Manter a segurança de sua senha e conta.</li>
                <li>Não utilizar a plataforma para fins ilícitos, ofensivos ou que infrinjam direitos de terceiros.</li>
                <li>Não realizar spam ou práticas abusivas de coleta de dados.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">4. Limitações da Plataforma</h2>
              <p className="text-muted-foreground">
                Embora trabalhemos para garantir 99.9% de uptime, a Avalia Prudente não se responsabiliza por interrupções temporárias de serviço devido a manutenções, falhas de provedores de infraestrutura (como Supabase ou Vercel) ou problemas de conexão do usuário final.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">5. Links Externos e Terceiros</h2>
              <p className="text-muted-foreground">
                Nossa plataforma permite a inclusão de links para serviços de terceiros (Google, WhatsApp, Instagram, etc.). Não temos controle sobre o conteúdo ou práticas desses serviços e não nos responsabilizamos por quaisquer danos resultantes do uso desses links externos.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">6. Suspensão e Encerramento</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, pratiquem fraudes ou prejudiquem a integridade da plataforma, sem aviso prévio em casos graves.
              </p>
            </section>

            <section className="space-y-4 text-foreground border-t pt-8">
              <h2 className="text-2xl font-bold">7. Disposições Gerais</h2>
              <p className="text-muted-foreground">
                Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
              </p>
              <p className="font-medium underline decoration-primary">Dúvidas? Entre em contato: contato@avaliaprudente.com.br</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
