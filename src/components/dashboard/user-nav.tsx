'use client'

import { useRouter } from 'next/navigation'
import {
  LogOut,
  Settings,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useEffect, useState, useMemo } from 'react'
import { logError } from '@/lib/error-handler'

export function UserNav() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('customer')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function getProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()
          
          if (profile) {
            setRole(profile.role)
          }
        }
      } catch (err) {
        logError(err, 'UserNav Profile Fetch')
      }
    }
    
    getProfile()
  }, [supabase])

  async function handleSignOut() {
    try {
      console.log('🚀 Initiating sign out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Saindo...')
      
      // Force a full page reload to clear all states and redirect
      window.location.href = '/login'
    } catch (err) {
      logError(err, 'Sign Out unexpected')
      // Fallback redirect even if signOut fails
      window.location.href = '/login'
    }
  }

  if (!mounted || !user) return <SkeletonAvatar />

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  const email = user.email || ''
  const avatarUrl = user.user_metadata?.avatar_url || ''
  
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group relative flex h-9 w-9 items-center justify-center rounded-full outline-none cursor-pointer transition-transform active:scale-95 border-none bg-transparent p-0"
      >
        <Avatar className="h-9 w-9 pointer-events-none ring-1 ring-border group-hover:ring-primary/50 transition-all">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold leading-none truncate">{displayName}</p>
              {role === 'admin' && (
                <span className="bg-destructive/10 text-destructive text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none shrink-0 border border-destructive/20">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate opacity-70">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer py-3"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4 opacity-60" />
          <span className="font-medium text-sm">Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          variant="destructive"
          className="cursor-pointer py-3"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-bold text-sm">Sair da conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SkeletonAvatar() {
  return (
    <div className="h-9 w-9 animate-pulse rounded-full bg-muted border border-border/20"></div>
  )
}
