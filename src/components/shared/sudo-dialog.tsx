'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { verifyPasswordForSudo, checkSudoStatus } from '@/app/auth/actions/sudo-actions'
import { toast } from 'sonner'

interface SudoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  title?: string
  description?: string
}

export function SudoDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  title = 'Confirme sua senha',
  description = 'Esta é uma ação sensível. Precisamos confirmar que é realmente você.'
}: SudoDialogProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset password when opened
  useEffect(() => {
    if (open) setPassword('')
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return

    setIsLoading(true)
    try {
      const result = await verifyPasswordForSudo(password)
      if (result.error) {
        toast.error('Erro de Autenticação', { description: result.error })
      } else if (result.success) {
        toast.success('Autenticação confirmada.')
        onOpenChange(false)
        onSuccess()
      }
    } catch {
      toast.error('Erro', { description: 'Ocorreu um erro ao verificar a senha.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="sudo-password">Senha Atual</Label>
            <Input
              id="sudo-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!password || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to wrap an action with a Sudo check.
 */
export function useSudo(actionTitle?: string, actionDescription?: string) {
  const [isSudoOpen, setIsSudoOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const executeWithSudo = async (action: () => void) => {
    try {
      const { hasSudo } = await checkSudoStatus()
      if (hasSudo) {
        action()
      } else {
        setPendingAction(() => action)
        setIsSudoOpen(true)
      }
    } catch (err) {
      console.error('Sudo check failed', err)
      toast.error('Erro ao verificar sessão segura.')
    }
  }

  const handleSudoSuccess = () => {
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const SudoModal = (
    <SudoDialog 
      open={isSudoOpen} 
      onOpenChange={setIsSudoOpen} 
      onSuccess={handleSudoSuccess}
      title={actionTitle}
      description={actionDescription}
    />
  )

  return { executeWithSudo, SudoModal }
}
