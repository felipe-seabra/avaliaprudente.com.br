'use client'

import { useRouter } from 'next/navigation'
import {
  LogOut,
  Settings,
  User as UserIcon,
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
import { useEffect, useState } from 'react'
import { parseError, logError } from '@/lib/error-handler'

export function UserNav() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('customer')

  useEffect(() => {
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
      const { error } = await supabase.auth.signOut()
      if (error) {
        logError(error, 'Sign Out')
        const normalized = parseError(error)
        toast.error(normalized.message)
      } else {
        router.push('/login')
        router.refresh()
      }
    } catch (err) {
      logError(err, 'Sign Out unexpected')
      toast.error('Erro ao sair da conta')
    }
  }

  if (!user) return <SkeletonAvatar />

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
        render={
          <button className="relative h-9 w-9 rounded-full focus:visible:ring-0 cursor-pointer outline-none hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={avatarUrl}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none truncate">
                {displayName}
              </p>
              {role === 'admin' && (
                <span className="bg-destructive/10 text-destructive text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Removed DropdownMenuGroup to simplify tree and avoid Base UI error #31 */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          variant="destructive"
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SkeletonAvatar() {
  return (
    <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
  )
}
