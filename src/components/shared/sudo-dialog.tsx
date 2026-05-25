'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { verifyPasswordForSudo, checkSudoStatus, getSudoAuthProvider } from '@/app/auth/actions/sudo-actions'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG } from '@/lib/constants'

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
  title = 'Confirme sua identidade',
  description = 'Esta é uma ação sensível. Precisamos confirmar que é realmente você.'
}: SudoDialogProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)

  // Fetch provider when opened
  useEffect(() => {
    if (open) {
      setPassword('')
      getSudoAuthProvider().then(setProvider)
    }
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

  async function handleGoogleReauth() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard'
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'login',
          },
          redirectTo: `${APP_CONFIG.url}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      
      if (error) throw error
    } catch (err) {
      console.error('Google reauth failed:', err)
      toast.error('Erro', { description: 'Não foi possível iniciar a autenticação com Google.' })
      setIsLoading(false)
    }
  }

  const isGoogleUser = provider === 'google'

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
        
        <div className="space-y-4 pt-4">
          {isGoogleUser && (
            <Button
              variant="outline"
              type="button"
              className="w-full flex items-center justify-center gap-2 h-11 font-bold border-muted-foreground/20 hover:bg-muted/50"
              onClick={handleGoogleReauth}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Confirmar com Google
                </>
              )}
            </Button>
          )}

          {isGoogleUser && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou use sua senha</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sudo-password">Senha Atual</Label>
              <Input
                id="sudo-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus={!isGoogleUser}
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
        </div>
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
