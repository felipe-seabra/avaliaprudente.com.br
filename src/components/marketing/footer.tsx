import Link from 'next/link'
import Image from 'next/image'
import { APP_CONFIG } from '@/lib/constants'
import { MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 bg-background">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/branding/logo-horizontal.webp"
                alt={APP_CONFIG.name}
                width={160}
                height={36}
                className="h-7 w-auto object-contain dark:invert"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Plataforma NFC inteligente para negócios locais. Aumente suas avaliações no Google e digitalize seu atendimento com uma única placa.
            </p>
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Falar com o Comercial
            </a>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Recursos</Link></li>
              <li><Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Como funciona</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Preços</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Política de privacidade</Link></li>
              <li><a href="mailto:contato@avaliaprudente.com.br" className="text-muted-foreground hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-30">
            NFC Digital Presence
          </div>
        </div>
      </div>
    </footer>
  )
}
