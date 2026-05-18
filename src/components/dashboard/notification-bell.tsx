'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Bell, Check, Trash2, ExternalLink, Clock, Inbox } from 'lucide-react'
import { 
  NotificationRepository, 
  Notification 
} from '@/core/infrastructure/repositories/supabase-notification-repository'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [repo] = useState(() => new NotificationRepository())
  const router = useRouter()

  const loadNotifications = useCallback(async () => {
    try {
      const [all, unread] = await Promise.all([
        repo.getAll(),
        repo.getUnreadCount()
      ])
      setNotifications(all)
      setUnreadCount(unread)
      setHasError(false)
    } catch (err: unknown) {
      console.error('Failed to load notifications', err)
      // If table is missing (404/PGRST205), we mark as error to hide the bell or show empty
      const error = err as { code?: string; status?: number };
      if (error?.code === 'PGRST205' || error?.status === 404) {
        setHasError(true)
      }
    }
  }, [repo])

  useEffect(() => {
    loadNotifications()

    let channel: { unsubscribe: () => void } | null = null;
    
    try {
      channel = repo.subscribe((newNotif: Notification) => {
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
        toast.info(newNotif.title, {
          description: newNotif.message,
          action: newNotif.action_url ? {
            label: 'Ver',
            onClick: () => router.push(newNotif.action_url!)
          } : undefined
        })
      })
    } catch (err) {
      console.error('Failed to subscribe to notifications', err)
    }

    return () => {
      if (channel) channel.unsubscribe()
    }
  }, [loadNotifications, router, repo])

  if (hasError) return null

  const handleMarkAsRead = async (id: string) => {
    try {
      await repo.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await repo.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('Todas as notificações marcadas como lidas')
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await repo.delete(id)
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== id)
        const removedWasUnread = prev.find(n => n.id === id && !n.is_read)
        if (removedWasUnread) setUnreadCount(c => Math.max(0, c - 1))
        return filtered
      })
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }

  const handleAction = (url: string | null, id: string) => {
    handleMarkAsRead(id)
    if (url) {
      router.push(url)
      setIsOpen(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSecs < 60) return 'agora'
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m`
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent p-0 outline-none cursor-pointer hover:bg-muted transition-colors border-none relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-0 overflow-hidden shadow-2xl border-primary/10">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
           <h3 className="font-bold text-sm flex items-center gap-2">
             <Bell className="h-4 w-4 text-primary" /> Notificações
           </h3>
           {unreadCount > 0 && (
             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tight" onClick={handleMarkAllAsRead}>
               <Check className="h-3 w-3 mr-1" /> Ler tudo
             </Button>
           )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground opacity-50">
               <Inbox className="h-10 w-10 mb-2" />
               <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "flex gap-3 p-4 border-b last:border-0 cursor-pointer transition-colors relative group",
                    !n.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted"
                  )}
                  onClick={() => handleAction(n.action_url, n.id)}
                >
                  <div className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    !n.is_read ? "bg-primary animate-pulse" : "bg-transparent"
                  )} />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm leading-none">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" /> {formatTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {n.action_url && (
                       <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase pt-1">
                          <ExternalLink className="h-2.5 w-2.5" /> Detalhes
                       </div>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, n.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
