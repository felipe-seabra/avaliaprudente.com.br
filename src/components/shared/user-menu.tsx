'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Star,
  Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin } from '@/lib/auth-utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserMenuProps {
  user: SupabaseUser
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [role, setRole] = useState<string>('customer')
  const [isSignOutLoading, setIsSignOutLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isSubscribed = true

    async function getProfile() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile && isSubscribed) {
          setRole(profile.role)
        }
      } catch (err) {
        console.error('UserMenu: Failed to fetch profile', err)
      }
    }
    
    getProfile()
    return () => { isSubscribed = false }
  }, [supabase, user.id])

  const handleSignOut = useCallback(async () => {
    if (isSignOutLoading) return
    setIsSignOutLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Saindo...')
      
      // Clear any local storage if needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('avaliaprudente_selected_business_id')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('UserMenu: Sign out error', err)
      toast.error('Erro ao sair. Tente novamente.')
    } finally {
      setIsSignOutLoading(false)
    }
  }, [supabase, isSignOutLoading, router])

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

  const isSuperAdmin = checkIsSuperAdmin(role)
  const isBusinessAdmin = checkIsAdmin(role) && !isSuperAdmin

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 border-none bg-transparent p-0 outline-none cursor-pointer">
        <Avatar className="h-10 w-10 pointer-events-none ring-2 ring-border group-hover:ring-primary/50 transition-all shadow-md">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 mt-2" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 py-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold leading-none truncate">{displayName}</p>
              {isSuperAdmin ? (
                <span className="bg-purple-600/10 text-purple-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none border border-purple-600/20">
                  Super Admin
                </span>
              ) : isBusinessAdmin ? (
                <span className="bg-primary/10 text-primary text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none border border-primary/20">
                  Empresa
                </span>
              ) : (
                <span className="bg-muted text-muted-foreground text-[9px] uppercase font-bold px-1.5 py-0.5 rounded leading-none border">
                  Avaliador
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate opacity-70">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          render={
            <Link href="/account" className="cursor-pointer flex items-center w-full">
              <Star className="mr-2 h-4 w-4 opacity-60" />
              <span className="font-medium text-sm">Minhas Avaliações</span>
            </Link>
          }
        />

        {(isBusinessAdmin || isSuperAdmin) && (
          <DropdownMenuItem 
            render={
              <Link href="/dashboard" className="cursor-pointer flex items-center w-full">
                <LayoutDashboard className="mr-2 h-4 w-4 opacity-60" />
                <span className="font-medium text-sm">Dashboard Empresa</span>
              </Link>
            }
          />
        )}

        {isSuperAdmin && (
          <DropdownMenuItem 
            render={
              <Link href="/admin" className="cursor-pointer flex items-center w-full text-purple-600 focus:text-purple-600 focus:bg-purple-600/5">
                <ShieldCheck className="mr-2 h-4 w-4 opacity-70" />
                <span className="font-bold text-sm">Painel Admin</span>
              </Link>
            }
          />
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          render={
            <Link href={isBusinessAdmin || isSuperAdmin ? "/dashboard/settings" : "/account"} className="cursor-pointer flex items-center w-full">
              <Settings className="mr-2 h-4 w-4 opacity-60" />
              <span className="font-medium text-sm">Configurações</span>
            </Link>
          }
        />

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
          onClick={handleSignOut}
          disabled={isSignOutLoading}
        >
          <LogOut className="mr-2 h-4 w-4 text-destructive group-focus:text-destructive-foreground" />
          <span className="font-bold text-sm text-destructive group-focus:text-destructive-foreground">
            {isSignOutLoading ? 'Saindo...' : 'Sair da conta'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
