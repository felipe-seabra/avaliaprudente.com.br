import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Termos de Serviço',
  description: 'Leia os termos e condições de uso da plataforma SaaS e dos produtos associados da Avalia Prudente.',
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
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-gradient">Termos de Serviço</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <p>Última atualização: 26 de maio de 2026 (Versão 2.0 - SaaS Edition)</p>
              <p>
                Bem-vindo à <strong>Avalia Prudente</strong>. Ao acessar nossa plataforma SaaS, interagir com nossos serviços de reputação, ou adquirir nossos produtos físicos associados, você reconhece que leu, compreendeu e concorda expressamente em estar vinculado por estes Termos de Serviço e todas as leis vigentes aplicáveis.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">1. Natureza do Serviço e Conteúdo Gerado pelo Usuário</h2>
              <p className="text-muted-foreground">
                A Avalia Prudente atua como uma plataforma de <i>software as a service</i> (SaaS) voltada ao gerenciamento interno de feedbacks e redirecionamento estratégico. Nós fornecemos os mecanismos tecnológicos para que empresas centralizem a comunicação com seus clientes.
              </p>
              <p className="text-muted-foreground">
                <strong>Limitação de Responsabilidade de Conteúdo:</strong> A Avalia Prudente <strong>não publica, endossa, modera proativamente nem controla</strong> ativamente o conteúdo de avaliações enviadas a plataformas externas (como Google Meu Negócio, TripAdvisor, etc.). Qualquer feedback ou avaliação deixada pelo consumidor final (User-Generated Content - UGC) em plataformas de terceiros é de sua exclusiva e indelegável responsabilidade civil e criminal. O papel da nossa infraestrutura é estritamente de roteamento e coleta interna.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">2. Condutas e Práticas Proibidas</h2>
              <p className="text-muted-foreground">
                A integridade do ecossistema e a confiabilidade de nossos serviços dependem da retidão de nossos clientes. Constitui violação direta e grave aos Termos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Avaliações Falsas e <i>Astroturfing</i>:</strong> Engenhar, encomendar, comercializar ou induzir artificialmente feedbacks enganosos em massa que violem políticas não só da Avalia Prudente, como das plataformas avaliadoras.</li>
                <li><strong>Abuso da Infraestrutura:</strong> Tentar burlar nossas arquiteturas antifraude (rate limits), executar scripts de raspagem de dados não autorizada (scraping), ataques de negação de serviço, ou manipulação de parâmetros internos do sistema.</li>
                <li><strong>Difamação de Terceiros e Concorrentes:</strong> Usar o produto, seja o painel ou as tags NFC, de modo indevido para caluniar, assediar concorrentes ou aplicar táticas comerciais maliciosas e desleais.</li>
                <li><strong>Conteúdo Ilegal:</strong> A hospedagem ou roteamento de materiais associados a crimes de ódio, violência, discriminação sistemática ou apologia ao crime por meio de URLs customizadas sob nosso domínio.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">3. Política de Moderação, Suspensão e Encerramento</h2>
              <p className="text-muted-foreground">
                A Avalia Prudente preserva integralmente o direito unilateral de auditar perfis que apresentem anomalias através de ferramentas automatizadas. As penalidades, que não exigem notificação prévia prolongada em cenários de risco iminente, incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Notificações e imposição de quarentenas operacionais.</li>
                <li>Restrição de acessibilidade, invisibilização de páginas vinculadas ou bloqueio do redirecionamento público de empresas.</li>
                <li>Banimento peremptório e irrevogável, com o bloqueio imediato do serviço, sem dever de restituição (refund) em situações que as violações configurarem risco legal para a plataforma ou fraude.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">4. Uso do Produto Físico (NFC/QR Codes)</h2>
              <p className="text-muted-foreground">
                Dispositivos de acionamento por contato (tags NFC e adesivos QR) são complementares ao serviço SaaS. O cliente garante a posse e o zelo adequados dos itens, assumindo riscos atrelados a vandalismo de terceiros, substituição ilícita (ataques de QR code replacement nos estabelecimentos), ou danos físicos resultantes de limpeza, intempéries e mau uso que possam desabilitar a etiqueta inteligente.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">5. Responsabilidades Comerciais e Futuros Modelos de Pagamento</h2>
              <p className="text-muted-foreground">
                Os Clientes Empresariais (Tenants) asseguram a veracidade das informações institucionais registradas. Nossa arquitetura destina-se a comportar modelos de assinatura escaláveis (<i>subscriptions</i>). Modificações supervenientes relativas à introdução de módulos pagos, precificação de planos SaaS, limites de uso (quotas) e parcerias com gateways de faturamento (como o Stripe), serão publicadas no dashboard de controle, sendo franqueado ao cliente seu direito de encerramento contratual antecipado se discordar.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                A marca, metodologias operacionais, bases de dados analíticas estruturadas pelo sistema, interfaces (UI/UX) e código-fonte, englobam-se como direitos autorais restritos da Avalia Prudente. A contratação de planos concebe única e exclusivamente a licença SaaS de uso temporário, não exclusiva, incomerciável e restritiva, vetando veementemente qualquer tentativa de sublicenciamento e engenharia reversa.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold font-heading">7. Declinação de Garantias (Disclaimer) e Isenção</h2>
              <p className="text-muted-foreground">
                Os serviços da Avalia Prudente são prestados em caráter &quot;AS IS&quot; (como se encontram) e &quot;AS AVAILABLE&quot; (conforme disponibilidade). Empenhamo-nos fortemente em aplicar infraestruturas seguras e com métricas de disponibilidade robustas. Contudo, <strong>isentamo-nos categoricamente de responsabilidade por:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Instabilidades ou quedas causadas por infraestruturas vitais de provedores em nuvem subjacentes, indisponibilidades repentinas do ecossistema OAuth, e instabilidades nas APIs ou portais de destino (Google Maps, etc).</li>
                <li>Prejuízos transacionais indiretos, perdas de lucros cessantes, perdas punitivas ou de oportunidades de negócios em face de ataques cibernéticos em larga escala aos nossos sistemas de banco de dados.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground border-t pt-8">
              <h2 className="text-2xl font-bold font-heading">8. Disposições Gerais e Foro</h2>
              <p className="text-muted-foreground">
                Os presentes Termos de Serviço suplantam quaisquer acordos orais e mantêm sua força vinculante mesmo com o advento de novas versões, sendo que o contínuo acesso implica irrevogável anuência da versão vigente. Qualquer litígio que exceda nossas capacidades amistosas de resolução técnica ou administrativa deverá se conformar exclusivamente no Foro jurídico correspondente da sede operacional da empresa.
              </p>
              <p className="font-medium underline decoration-primary mt-6">Para relatórios de abusos sistêmicos ou infrações legais, notifique: contato@avaliaprudente.com.br</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
