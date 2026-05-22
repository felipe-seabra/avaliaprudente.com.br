'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BrandIcons } from '@/components/shared/brand-icons'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { APP_CONFIG } from '@/lib/constants'

interface SocialAuthProps {
  isLoading?: boolean
  next?: string
  text?: string
}

export function SocialAuth({ isLoading: parentLoading, next = '/dashboard', text = 'Continuar com Google' }: SocialAuthProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${APP_CONFIG.url}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        toast.error('Erro ao iniciar login com Google')
        console.error('OAuth Error:', error)
        setIsLoading(false)
      }
    } catch (err) {
      toast.error('Erro inesperado ao iniciar login')
      console.error('Unexpected OAuth Error:', err)
      setIsLoading(false)
    }
  }

  const disabled = isLoading || parentLoading

  return (
    <div className="space-y-4 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou</span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 font-bold gap-3 transition-all hover:bg-primary/5 active:scale-[0.98] rounded-xl border-muted-foreground/20"
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <BrandIcons.Google size={20} className="text-[#4285F4]" />
        )}
        {text}
      </Button>
    </div>
  )
}
