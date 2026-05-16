import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-muted/30">
      <h2 className="text-7xl font-bold tracking-tight text-primary mb-4">404</h2>
      <h3 className="text-2xl font-bold mb-4">Página não encontrada</h3>
      <p className="text-muted-foreground max-w-md mb-8">
        A página que você está procurando pode ter sido removida, mudou de nome ou está temporariamente indisponível.
      </p>
      <Button render={<Link href="/" />} size="lg">
        Voltar para a página inicial
      </Button>
    </div>
  )
}
