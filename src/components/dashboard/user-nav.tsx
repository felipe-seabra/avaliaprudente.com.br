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
import { useEffect, useState, useMemo, useCallback } from 'react'

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('customer')
  const [mounted, setMounted] = useState(false)
  const [isSignOutLoading, setIsSignOutLoading] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setMounted(true)
    let isSubscribed = true

    async function getProfile() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser && isSubscribed) {
          setUser(authUser)
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()
          
          if (profile && isSubscribed) {
            setRole(profile.role)
          }
        }
      } catch (err) {
        console.error('UserNav: Failed to fetch profile', err)
      }
    }
    
    getProfile()
    return () => { isSubscribed = false }
  }, [supabase])

  const handleSignOut = useCallback(async () => {
    if (isSignOutLoading) return
    setIsSignOutLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Saindo...')
      window.location.href = '/login'
    } catch (err) {
      console.error('UserNav: Sign out error', err)
      window.location.href = '/login'
    } finally {
      setIsSignOutLoading(false)
    }
  }, [supabase, isSignOutLoading])

  if (!mounted || !user) {
    return <div className="h-9 w-9 rounded-full bg-muted border border-border/20 animate-pulse" />
  }

  const meta = user.user_metadata || {}
  const displayName = String(meta.full_name || user.email?.split('@')[0] || 'Usuário')
  const email = user.email || ''
  const avatarUrl = String(meta.avatar_url || '')
  
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group relative flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95 border-none bg-transparent p-0 outline-none cursor-pointer">
        <Avatar className="h-9 w-9 pointer-events-none ring-1 ring-border group-hover:ring-primary/50 transition-all shadow-sm">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold leading-none truncate">{displayName}</p>
              {role === 'super_admin' ? (
                <span className="bg-purple-600/10 text-purple-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none border border-purple-600/20">
                  Super Admin
                </span>
              ) : role === 'admin' ? (
                <span className="bg-destructive/10 text-destructive text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none border border-destructive/20">
                  Admin
                </span>
              ) : null}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate opacity-70">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4 opacity-60" />
          <span className="font-medium text-sm">Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          variant="destructive"
          className="cursor-pointer"
          onClick={handleSignOut}
          disabled={isSignOutLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-bold text-sm">
            {isSignOutLoading ? 'Saindo...' : 'Sair da conta'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
