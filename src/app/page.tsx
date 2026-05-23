import { Navbar } from '@/components/marketing/navbar'
import { ComplianceBar } from '@/components/marketing/compliance-bar'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Pricing } from '@/components/marketing/pricing'
import { FAQ } from '@/components/marketing/faq'
import { Footer } from '@/components/marketing/footer'
import { BusinessRanking } from '@/components/marketing/business-ranking'
import { PlatformPurpose } from '@/components/marketing/platform-purpose'
import { CrawlerComplianceSection } from '@/components/marketing/crawler-compliance'
import { Star, ShieldCheck, Zap, ShoppingBag } from 'lucide-react'
import { getPublicRankings } from '@/core/application/use-cases/get-public-rankings'

export const revalidate = 3600

export default async function Home() {
  const { topRated, mostViewed } = await getPublicRankings()

  return (
    <div className="flex min-h-screen flex-col">
      <ComplianceBar />
      <Navbar />
      <main className="flex-1">
        <Hero />

        <CrawlerComplianceSection />
        
        {/* Onboarding Section */}
        <section className="py-20 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 md:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-black tracking-tight mb-4">Como funciona?</h2>
               <p className="text-muted-foreground max-w-xl mx-auto">
                 Quatro passos simples para transformar o balcão da sua empresa em uma máquina de avaliações 5 estrelas.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: 1, title: 'Crie sua empresa', desc: 'Cadastre seu negócio em segundos e tenha um link único.', icon: Zap },
                  { step: 2, title: 'Personalize a página', desc: 'Adicione sua logo, descrição e links das redes sociais.', icon: Star },
                  { step: 3, title: 'Receba sua Tag NFC', desc: 'Peça sua tag física inteligente para colocar no seu balcão.', icon: ShoppingBag },
                  { step: 4, title: 'Colete avaliações', desc: 'Seus clientes aproximam o celular e avaliam instantaneamente.', icon: ShieldCheck },
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    <div className="bg-background p-8 rounded-3xl border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 text-center space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg">{item.step}. {item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <section className="py-32">
          <div className="container mx-auto px-4 md:px-8">
             <div className="text-center mb-16">
               <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                 Explorar
               </div>
               <h2 className="text-4xl font-black tracking-tight mb-4">Empresas em Destaque</h2>
               <p className="text-muted-foreground max-w-xl mx-auto">
                 Conheça os negócios que estão transformando sua reputação digital com o Avalia Prudente.
               </p>
             </div>
             <BusinessRanking topRated={topRated} mostViewed={mostViewed} />
          </div>
        </section>

        <PlatformPurpose />

        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
