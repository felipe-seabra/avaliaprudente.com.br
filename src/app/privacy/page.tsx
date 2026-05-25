import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a Avalia Prudente coleta, utiliza e protege seus dados em conformidade com a LGPD e regulamentações.',
  alternates: {
    canonical: 'https://www.avaliaprudente.com.br/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl bg-card p-8 md:p-12 rounded-3xl shadow-xl border-none">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-gradient">Política de Privacidade</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <p>Última atualização: 26 de maio de 2026</p>
              <p>
                A <strong>Avalia Prudente</strong> valoriza a sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos as informações coletadas através da nossa plataforma SaaS, serviços de gestão de reputação e produtos NFC.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">1. Conformidade com a LGPD e Princípios</h2>
              <p className="text-muted-foreground">
                Nossas práticas de tratamento de dados pessoais são estritamente regidas pela Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD) e aderem a padrões internacionais de proteção de dados. Adotamos o princípio da minimização de dados, onde coletamos apenas o estritamente necessário para o funcionamento da plataforma.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">2. Dados que Coletamos e Por Que</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Para Clientes (Empresas):</strong> Coletamos nome completo, e-mail, senha (criptografada) ou dados de autenticação social, informações do negócio (nome, logo, redes sociais) e dados operacionais para configuração do seu painel e, futuramente, processamento de pagamentos.</p>
                <p><strong>Para Usuários Finais (Consumidores):</strong> Para submeter um feedback interno, utilizamos mecanismos de autenticação e proteção antifraude. Coletamos o identificador da conta (quando autenticado), o nome público informado, a nota e o comentário opcional. <br/><br/><strong>Importante:</strong> Feedbacks positivos podem direcionar os usuários para plataformas externas (como Google Meu Negócio); a Avalia Prudente <strong>não</strong> publica avaliações em plataformas externas em nome dos usuários. Tais plataformas possuem suas próprias políticas de privacidade e termos de uso.</p>
                <p><strong>Dados Técnicos e de Segurança:</strong> Coletamos e mantemos logs de segurança (audit logs), endereços IP (processados temporariamente para rate limiting e proteção contra ataques de negação de serviço e fraude), tipo de dispositivo, navegador, e dados de sessão protegidos.</p>
              </div>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">3. Autenticação OAuth (Google)</h2>
              <p className="text-muted-foreground">
                Utilizamos o Google OAuth para fornecer uma experiência de login rápida, sem senhas adicionais e altamente segura. Ao utilizar o Google para entrar na plataforma, acessamos exclusivamente os dados básicos do seu perfil autorizados por você no momento do login (nome, endereço de e-mail e foto de perfil pública).
              </p>
              <p className="text-muted-foreground">
                <strong>Por que usamos:</strong> Para verificar a autenticidade dos usuários, estabelecer uma camada robusta de proteção contra contas falsas (spam) e garantir a segurança do ecossistema.
              </p>
              <p className="text-muted-foreground">
                <strong>Revogação de Acesso:</strong> Você pode revogar o acesso da Avalia Prudente à sua conta Google a qualquer momento através das configurações de segurança e privacidade da sua própria conta Google (Painel de Permissões de Terceiros).
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">4. Antifraude, Analytics e Monitoramento</h2>
              <p className="text-muted-foreground">
                Para prevenir spam, manipulação de reputação e garantir a integridade da plataforma, empregamos mecanismos avançados de proteção antifraude. Estes incluem rate limiting dinâmico e o uso de fingerprints técnicos anonimizados, que são identificadores gerados matematicamente (hashes) a partir de sinais não pessoais de navegação e rede. Esses dados <strong>não</strong> são utilizados para anúncios ou retargeting e não o identificam publicamente.
              </p>
              <p className="text-muted-foreground">
                Utilizamos sistemas de telemetria operacional e um motor de analytics proprietário. Os dados de analytics servem apenas para fins estatísticos internos e para prover métricas anonimizadas de engajamento (visualizações e cliques) às empresas parceiras. A plataforma utiliza infraestrutura em nuvem de ponta (Supabase), que atua sob os mais altos padrões de conformidade de segurança global (SOC2, ISO).
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">5. Cookies e Sessões</h2>
              <p className="text-muted-foreground">
                Empregamos cookies exclusivamente de natureza técnica e estritamente necessários. Eles são utilizados para manter a sua sessão segura no dashboard, preservar estados de autenticação, aplicar preferências de segurança e mitigar vetores de ataque (como ataques CSRF). Não utilizamos cookies invasivos de terceiros para fins de marketing ou rastreamento intersites (cross-site tracking).
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">6. Retenção e Exclusão de Dados</h2>
              <p className="text-muted-foreground">
                Os dados pessoais são retidos em ambientes de armazenamento criptografados somente pelo tempo necessário para cumprir as finalidades para as quais foram coletados, como a prestação dos serviços, ou para o cumprimento imperativo de obrigações legais, auditorias regulatórias e resolução de litígios.
              </p>
              <p className="text-muted-foreground">
                Para solicitar a exclusão definitiva de sua conta, de seus feedbacks internos atrelados a ela, ou de outros dados associados, você pode contatar <a href="mailto:contato@avaliaprudente.com.br" className="text-primary hover:underline">contato@avaliaprudente.com.br</a>. Adicionalmente, forneceremos opções integradas de remoção diretamente pelo painel do usuário no futuro. O processamento da sua solicitação respeitará integralmente os prazos e deveres estipulados pela legislação vigente.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground">
                Na condição de titular dos dados, é-lhe garantido por lei exercer, a qualquer momento e mediante requisição:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>A confirmação da existência de tratamento.</li>
                <li>O acesso simplificado ou detalhado aos seus dados.</li>
                <li>A correção de informações incompletas, inexatas ou desatualizadas em sua posse.</li>
                <li>A portabilidade de seus dados a outro prestador de serviço.</li>
                <li>A anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos em relação à finalidade estipulada.</li>
                <li>A revogação do consentimento, bem como informações sobre os impactos da negativa.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground border-t pt-8">
              <h2 className="text-2xl font-bold">8. Contato e Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground">
                A Avalia Prudente toma medidas contínuas para atualizar suas práticas de proteção. Se você tiver perguntas sobre esta Política, nossas certificações implícitas de segurança, ou desejar formalizar uma solicitação ligada aos seus direitos, contate nosso responsável:
              </p>
              <p className="font-medium text-lg mt-2">E-mail: contato@avaliaprudente.com.br</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
