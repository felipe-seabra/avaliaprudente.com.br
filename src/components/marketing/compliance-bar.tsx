export function ComplianceBar() {
  return (
    <div className="w-full bg-background border-b border-border py-2 relative z-[60]">
      <div className="container mx-auto px-4 md:px-8 flex justify-center items-center gap-3 md:gap-6 text-[10px] md:text-xs text-foreground font-bold">
        <a href="/privacy" className="hover:text-primary transition-colors underline underline-offset-2">
          Política de Privacidade
        </a>
        <span className="text-border">•</span>
        <a href="/terms" className="hover:text-primary transition-colors underline underline-offset-2">
          Termos de Uso
        </a>
        <span className="text-border">•</span>
        <a href="/contact" className="hover:text-primary transition-colors underline underline-offset-2">
          Contato
        </a>
      </div>
    </div>
  )
}
