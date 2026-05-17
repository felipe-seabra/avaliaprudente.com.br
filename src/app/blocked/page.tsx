import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Ban } from 'lucide-react'
import Link from 'next/link'

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full border-destructive/20 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-black text-destructive">Acesso Bloqueado</CardTitle>
          <CardDescription className="text-base mt-2">
            Sua conta foi suspensa por violação dos termos de uso da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4 pb-6 text-sm text-muted-foreground">
          Se você acredita que isso é um erro, entre em contato com nosso suporte para solicitar uma revisão do seu caso.
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-muted/10 pt-6">
          <Button variant="outline" className="font-bold" asChild>
            <Link href="mailto:suporte@avaliaprudente.com.br">Contatar Suporte</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
