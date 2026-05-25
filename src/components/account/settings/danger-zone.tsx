'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { deactivateAccount } from '@/app/account/settings/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSudo } from '@/components/shared/sudo-dialog'

export function DangerZone() {
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { executeWithSudo, SudoModal } = useSudo(
    'Autenticação Necessária',
    'Para desativar sua conta, confirme sua senha.'
  )

  const executeDeactivation = async () => {
    setIsDeactivating(true)
    try {
      const result = await deactivateAccount()
      if (result?.error) {
        toast.error(result.error)
        setIsDeactivating(false)
      } else {
        toast.success('Sua conta foi desativada com sucesso.')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao desativar sua conta.')
      console.error(error)
      setIsDeactivating(false)
    }
  }

  const handleDeactivate = () => {
    setIsOpen(false)
    executeWithSudo(executeDeactivation)
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription className="text-destructive/80 font-medium">
          Ações irreversíveis ou que requerem atenção especial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold">Desativar Minha Conta</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Isso ocultará seu perfil e desativará seu acesso. Suas avaliações permanecerão salvas mas seu nome será anonimizado se solicitado.
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive" size="sm" className="font-bold cursor-pointer">
                  Desativar Conta
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Confirmar Desativação
                </DialogTitle>
                <DialogDescription className="pt-2">
                  Tem certeza que deseja desativar sua conta? Você será deslogado imediatamente e seu acesso será suspenso.
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 my-4">
                <p className="text-xs text-destructive font-medium italic">
                  Atenção: Para reativar sua conta futuramente, você precisará entrar em contato com o suporte oficial.
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isDeactivating}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeactivate} 
                  disabled={isDeactivating}
                  className="font-bold cursor-pointer"
                >
                  {isDeactivating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sim, Desativar Minha Conta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {SudoModal}
      </CardContent>
    </Card>
  )
}
