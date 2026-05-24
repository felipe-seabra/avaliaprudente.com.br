/**
 * COMPLIANCE-SAFE LEGAL NAVIGATION BLOCK
 * This component is specifically designed for crawler compatibility (Google OAuth verification).
 * - SSR rendered (no JS required)
 * - Standard <a> tags for maximum crawler detectability
 * - High contrast, no opacity tricks
 * - No animations or transitions
 */
export function LegalFooterBlock() {
  return (
    <nav 
      aria-label="Legal links" 
      className="w-full bg-background border-t border-border py-6 relative z-10"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm font-semibold text-foreground">
          <a 
            href="/privacy" 
            className="hover:text-primary underline decoration-primary/30 underline-offset-4 transition-none"
          >
            Política de Privacidade
          </a>
          <a 
            href="/terms" 
            className="hover:text-primary underline decoration-primary/30 underline-offset-4 transition-none"
          >
            Termos de Uso
          </a>
          <a 
            href="/contact" 
            className="hover:text-primary underline decoration-primary/30 underline-offset-4 transition-none"
          >
            Contato
          </a>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Crawler Compliance Block
          </p>
        </div>
      </div>
    </nav>
  )
}
