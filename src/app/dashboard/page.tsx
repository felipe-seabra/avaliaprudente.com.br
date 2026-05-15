'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Erro ao sair', {
        description: error.message,
      })
      return
    }

    toast.success('Sessão encerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Bem-vindo ao seu painel! Esta é uma área protegida.
      </p>
      <Button variant="outline" onClick={handleLogout}>
        Sair da conta
      </Button>
    </div>
  )
}
