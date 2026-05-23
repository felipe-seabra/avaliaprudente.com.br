import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle, MapPin } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com a equipe do Avalia Prudente para suporte, vendas ou parcerias.',
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gradient">Como podemos ajudar?</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Estamos prontos para atender você. Escolha o melhor canal de comunicação abaixo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-muted-foreground mb-6 flex-1 text-sm">
                Atendimento rápido para dúvidas comerciais e suporte direto.
              </p>
              <Button 
                className="w-full rounded-xl font-bold"
                render={
                  <a 
                    href={`https://wa.me/${APP_CONFIG.whatsappOrderNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                  />
                }
              >
                Chamar no Zap
              </Button>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">E-mail</h3>
              <p className="text-muted-foreground mb-6 flex-1 text-sm">
                Para parcerias, questões jurídicas ou solicitações formais.
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-xl font-bold border-2"
                render={
                  <a href="mailto:contato@avaliaprudente.com.br" />
                }
              >
                Enviar E-mail
              </Button>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center flex flex-col items-center opacity-60">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Presencial</h3>
              <p className="text-muted-foreground mb-6 flex-1 text-sm">
                Presidente Prudente - SP e região. Atendimento sob agendamento.
              </p>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">
                Born in Prudente
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[2rem] p-8 md:p-12 border border-primary/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Dúvidas Frequentes</h2>
            <p className="text-muted-foreground mb-8">
              Talvez a resposta que você procura já esteja em nosso FAQ.
            </p>
            <Button 
              variant="ghost" 
              render={<Link href="/#faq" />}
              className="font-bold text-primary"
            >
              Ver FAQ do Avalia
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
