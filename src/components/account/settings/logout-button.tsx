'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Saindo...')
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('LogoutButton: Sign out error', err)
      toast.error('Erro ao sair. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleSignOut} 
      disabled={isLoading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sair da Conta
    </Button>
  )
}
