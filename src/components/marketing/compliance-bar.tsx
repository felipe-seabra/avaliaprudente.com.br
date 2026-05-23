import Link from 'next/link'

export function ComplianceBar() {
  return (
    <div className="w-full bg-muted/30 border-b border-border/40 py-2 relative z-[60]">
      <div className="container mx-auto px-4 md:px-8 flex justify-center items-center gap-3 md:gap-6 text-[10px] md:text-xs text-muted-foreground font-medium">
        <Link href="/privacy" className="hover:text-primary transition-colors">
          Política de Privacidade
        </Link>
        <span className="text-border">•</span>
        <Link href="/terms" className="hover:text-primary transition-colors">
          Termos de Uso
        </Link>
        <span className="text-border">•</span>
        <Link href="/contact" className="hover:text-primary transition-colors">
          Contato
        </Link>
      </div>
    </div>
  )
}
