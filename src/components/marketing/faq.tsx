import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Como funciona o filtro de avaliações?',
    answer: 'Quando o cliente escaneia o QR Code, ele é levado para uma página com a sua marca para dar uma nota de 1 a 5 estrelas. Se ele der 4 ou 5 estrelas, é redirecionado automaticamente para o seu Google Meu Negócio. Se der de 1 a 3 estrelas, abrimos um formulário de feedback interno que vai direto para o seu painel, e ele NÃO é redirecionado para o Google.',
  },
  {
    question: 'Eu preciso de conhecimento técnico para usar?',
    answer: 'Não! Nossa plataforma foi desenhada para ser extremamente fácil. Em menos de 5 minutos você cadastra sua empresa, gera seu QR Code e já pode começar a receber avaliações.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, não temos fidelidade. Você pode cancelar sua assinatura a qualquer momento com apenas um clique no seu painel de controle.',
  },
  {
    question: 'Onde encontro o link do meu Google Meu Negócio?',
    answer: 'Dentro da plataforma temos um tutorial rápido de como encontrar o seu "Place ID" do Google em segundos. É muito simples!',
  },
]

export function FAQ() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre o Avalia Prudente.
          </p>
        </div>
        
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
