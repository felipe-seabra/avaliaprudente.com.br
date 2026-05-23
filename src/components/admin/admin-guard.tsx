'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'authorized' | 'redirecting'>('loading')

  useEffect(() => {
    let isMounted = true

    async function check() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        if (isMounted) {
          setStatus('redirecting')
          router.push('/login')
        }
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const isAdmin = checkIsAdmin(profile?.role)

      if (isAdmin) {
        if (isMounted) setStatus('authorized')
      } else {
        if (isMounted) {
          setStatus('redirecting')
          router.push('/dashboard')
        }
      }
    }

    check()
    return () => { isMounted = false }
  }, [router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] w-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin text-destructive border-4 border-t-transparent rounded-full" />
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-foreground">Acesso Restrito</p>
            <p className="text-xs font-bold text-muted-foreground animate-pulse mt-1">Validando Credenciais de Administrador...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'redirecting') {
    return null
  }

  return <>{children}</>
}
