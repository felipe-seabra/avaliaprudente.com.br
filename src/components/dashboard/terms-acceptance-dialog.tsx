'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import Link from 'next/link'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export function TermsAcceptanceDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkTerms() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('terms_accepted_at, terms_version, role')
        .eq('id', user.id)
        .single()
      
      if (profile && profile.role !== 'admin') {
        const currentVersion = APP_CONFIG.currentTermsVersion
        if (!profile.terms_accepted_at || profile.terms_version !== currentVersion) {
          setOpen(true)
        }
      }
    }

    checkTerms()
  }, [supabase])

  async function handleAccept() {
    if (!accepted) {
      toast.error('Você deve marcar a caixa para aceitar os termos.')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted_at: new Date().toISOString(),
          terms_version: APP_CONFIG.currentTermsVersion
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Termos aceitos com sucesso!')
      setOpen(false)
    } catch (error) {
      console.error('Error accepting terms:', error)
      toast.error('Erro ao salvar aceitação dos termos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="h-6 w-6" />
            <DialogTitle className="text-xl">Atualização dos Termos de Uso</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Para continuar utilizando a plataforma Avalia Prudente, você precisa revisar e aceitar a versão mais recente dos nossos Termos de Uso (v{APP_CONFIG.currentTermsVersion}).
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-4 my-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold text-foreground">O que mudou nesta versão?</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Detalhamento da Política de Moderação Progressiva.</li>
                <li>Proibição explícita de avaliações fraudulentas.</li>
                <li>Novas regras para suspensão e banimento de contas.</li>
                <li>Regras de congelamento de empresas por violação.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Ao aceitar, você confirma que leu e concorda em cumprir todas as regras de comportamento e boas práticas da plataforma.
          </p>
        </div>

        <div className="flex items-start space-x-3 py-2">
          <Checkbox 
            id="terms-dialog-accept" 
            checked={accepted} 
            onCheckedChange={(checked) => setAccepted(checked === true)} 
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms-dialog-accept"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Eu li e aceito os{' '}
              <Link href="/terms" target="_blank" className="text-primary hover:underline font-bold">
                Termos de Uso
              </Link>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full font-bold h-11" 
            onClick={handleAccept} 
            disabled={loading || !accepted}
          >
            {loading ? 'Salvando...' : 'Aceitar e Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
