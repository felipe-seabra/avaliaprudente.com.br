import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Leia os termos e condições de uso da plataforma SaaS e dos produtos NFC da Avalia Prudente.',
  alternates: {
    canonical: 'https://www.avaliaprudente.com.br/terms',
  },
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
              <p>Última atualização: 19 de maio de 2026 (Versão 1.2)</p>
              <p>
                Bem-vindo ao <strong>Avalia Prudente</strong>. Ao acessar nossa plataforma ou adquirir nossos produtos físicos (Tags NFC), você concorda em cumprir e estar vinculado aos seguintes Termos de Uso.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">1. Objeto do Serviço</h2>
              <p className="text-muted-foreground">
                O Avalia Prudente é uma plataforma SaaS (Software as a Service) que permite a criação de páginas públicas modulares acessíveis via NFC ou QR Code, com foco em gestão de avaliações e conexões digitais para negócios locais.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">2. Comportamento Proibido e Fraudes</h2>
              <p className="text-muted-foreground">
                Para manter a integridade da plataforma, é estritamente proibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Avaliações Falsas:</strong> Criar, solicitar ou incentivar avaliações fraudulentas ou enganosas.</li>
                <li><strong>Abuso do Sistema:</strong> Tentar burlar filtros de avaliação ou manipular rankings através de meios automatizados.</li>
                <li><strong>Conteúdo Impróprio:</strong> Publicar material ofensivo, discriminatório ou ilegal em suas páginas públicas.</li>
                <li><strong>Impedir Concorrência:</strong> Usar a plataforma para difamar ou prejudicar concorrentes de forma desonesta.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">3. Política de Moderação e Abuso</h2>
              <p className="text-muted-foreground">
                A Avalia Prudente reserva-se o direito de monitorar o uso da plataforma para garantir o cumprimento destes termos. Dispomos de um sistema de moderação progressivo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Advertências:</strong> Notificações formais sobre comportamentos que violam nossos termos.</li>
                <li><strong>Suspensão Temporária:</strong> Bloqueio de acesso ao painel de controle por um período de 3 a 90 dias.</li>
                <li><strong>Banimento Permanente:</strong> Encerramento definitivo da conta em casos de reincidência ou violações graves.</li>
                <li><strong>Congelamento de Empresa:</strong> Remoção imediata da visibilidade pública de uma empresa e desativação de seus links/QR Codes.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">4. Uso do Produto Físico (NFC)</h2>
              <p className="text-muted-foreground">
                As tags NFC fornecidas são de propriedade do comprador após a confirmação da assinatura/pagamento. A Avalia Prudente garante a funcionalidade do chip NFC no momento da entrega. Danos causados por mau uso, exposição a calor excessivo ou produtos químicos são de responsabilidade do cliente.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">5. Responsabilidades e Limitações</h2>
              <p className="text-muted-foreground">
                Embora trabalhemos para garantir a máxima disponibilidade, a Avalia Prudente não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Interrupções temporárias de serviço devido a manutenções ou falhas de infraestrutura externa.</li>
                <li>Perda de dados resultante de ações do usuário ou exclusão de conta.</li>
                <li>Conteúdo postado por usuários ou interações em links externos (Google, WhatsApp, etc.).</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground border-t pt-8">
              <h2 className="text-2xl font-bold font-heading">6. Disposições Gerais</h2>
              <p className="text-muted-foreground">
                Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos. A versão atual (1.2) entra em vigor imediatamente para todos os usuários.
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
