import { Metadata } from 'next'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a Avalia Prudente coleta, utiliza e protege seus dados em conformidade com a LGPD.',
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
              <p>Última atualização: 16 de maio de 2026</p>
              <p>
                A <strong>Avalia Prudente</strong> valoriza a sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos as informações coletadas através da nossa plataforma e produtos NFC.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">1. Conformidade com a LGPD</h2>
              <p className="text-muted-foreground">
                Nossas práticas de tratamento de dados pessoais são regidas pela Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), garantindo transparência, segurança e respeito aos direitos dos titulares.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">2. Dados que Coletamos</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Para Clientes (Empresas):</strong> Coletamos nome completo, e-mail, senha (criptografada), informações do negócio (nome, logo, redes sociais) e dados de uso da plataforma.</p>
                <p><strong>Para Usuários Finais (Consumidores):</strong> Ao interagir com uma placa NFC ou QR Code, podemos coletar (se fornecido opcionalmente no formulário de feedback) nome, e-mail e a avaliação/comentário deixado para a empresa.</p>
                <p><strong>Dados Técnicos:</strong> Coletamos automaticamente dados de acesso, como endereço IP (para rate limiting), tipo de dispositivo, navegador e logs de interação (cliques em botões e visitas à página).</p>
              </div>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">3. Uso de Analytics e Rastreamento</h2>
              <p className="text-muted-foreground">
                Utilizamos um sistema de analytics próprio para fornecer às empresas métricas de engajamento. Rastreamos quando um link é clicado ou uma página é visualizada via NFC/QR. Esses dados são utilizados exclusivamente para fins estatísticos e de melhoria da experiência do usuário.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">4. Cookies e Sessões</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para manter você autenticado em nosso dashboard e para garantir a segurança da navegação. Não utilizamos cookies de rastreamento de terceiros para publicidade comportamental.
              </p>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">5. Direitos do Usuário</h2>
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Confirmar a existência de tratamento de seus dados.</li>
                <li>Acessar seus dados pessoais.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
            </section>

            <section className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">6. Remoção de Dados</h2>
              <p className="text-muted-foreground">
                Para solicitar a exclusão definitiva de sua conta e de todos os dados associados, entre em contato através do e-mail <a href="mailto:contato@avaliaprudente.com.br" className="text-primary hover:underline">contato@avaliaprudente.com.br</a>. Processaremos sua solicitação em conformidade com os prazos legais.
              </p>
            </section>

            <section className="space-y-4 text-foreground border-t pt-8">
              <h2 className="text-2xl font-bold">7. Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver qualquer dúvida sobre esta Política ou sobre como seus dados são tratados, fale conosco:
              </p>
              <p className="font-medium">E-mail: contato@avaliaprudente.com.br</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
