'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Briefcase, 
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import { PageLink } from '@/core/domain/entities'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'
import { BrandIcons } from '@/components/shared/brand-icons'
import { cn } from '@/lib/utils'

interface CTAButtonProps {
  link: PageLink
  businessId: string
  onClick?: () => void
}

export function CTAButton({ link, businessId, onClick }: CTAButtonProps) {
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  const { icon, color } = useMemo(() => {
    const type = link.type.toLowerCase()
    const url = (link.url || '').toLowerCase()

    // 1. Explicit Type Mapping
    if (type === 'google_review') return { icon: <BrandIcons.Google size={22} />, color: 'text-[#4285F4]' }
    if (type === 'whatsapp' || url.includes('wa.me') || url.includes('whatsapp.com')) 
      return { icon: <BrandIcons.WhatsApp size={24} />, color: 'text-[#25D366]' }
    if (type === 'instagram' || url.includes('instagram.com')) 
      return { icon: <BrandIcons.Instagram size={22} />, color: 'text-[#E4405F]' }
    if (type === 'facebook' || url.includes('facebook.com')) 
      return { icon: <BrandIcons.Facebook size={22} />, color: 'text-[#1877F2]' }
    if (type === 'tiktok' || url.includes('tiktok.com')) 
      return { icon: <BrandIcons.TikTok size={22} />, color: 'text-[#000000] dark:text-white' }
    if (type === 'youtube' || url.includes('youtube.com')) 
      return { icon: <BrandIcons.YouTube size={22} />, color: 'text-[#FF0000]' }
    if (type === 'linkedin' || url.includes('linkedin.com')) 
      return { icon: <BrandIcons.LinkedIn size={22} />, color: 'text-[#0A66C2]' }
    if (type === 'twitter' || type === 'x' || url.includes('twitter.com') || url.includes('x.com')) 
      return { icon: <BrandIcons.Twitter size={20} />, color: 'text-[#000000] dark:text-white' }
    if (type === 'telegram' || url.includes('t.me')) 
      return { icon: <BrandIcons.Telegram size={22} />, color: 'text-[#24A1DE]' }
    if (type === 'discord' || url.includes('discord.gg')) 
      return { icon: <BrandIcons.Discord size={22} />, color: 'text-[#5865F2]' }
    
    // 2. Utility / Action Mapping
    if (url.startsWith('tel:')) return { icon: <Phone size={22} />, color: 'text-blue-500' }
    if (url.startsWith('mailto:')) return { icon: <Mail size={22} />, color: 'text-orange-500' }
    if (url.includes('maps.google') || url.includes('goo.gl/maps')) 
      return { icon: <MapPin size={22} />, color: 'text-red-500' }

    // 3. Fallbacks
    if (type === 'website') return { icon: <Globe size={22} />, color: 'text-primary' }
    if (type === 'portfolio') return { icon: <Briefcase size={22} />, color: 'text-primary' }
    
    return { icon: <LinkIcon size={22} />, color: 'text-muted-foreground' }
  }, [link.type, link.url])

  const handleClick = () => {
    // Track click
    analyticsRepo.track({
      business_id: businessId,
      page_id: link.page_id,
      link_id: link.id,
      event_type: 'cta_click',
      metadata: { type: link.type, title: link.title }
    })

    if (onClick) {
      onClick()
    } else if (link.url) {
      const url = link.url.startsWith('http') || link.url.startsWith('tel:') || link.url.startsWith('mailto:')
        ? link.url
        : `https://${link.url}`
      window.open(url, '_blank')
    }
  }

  const hostname = useMemo(() => {
    if (!link.url || link.url.startsWith('tel:') || link.url.startsWith('mailto:')) return null
    try {
      return new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname.replace('www.', '')
    } catch (e) {
      return null
    }
  }, [link.url])

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full h-20 justify-start gap-0 p-0 text-base font-bold shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:border-primary/40 group bg-background/80 backdrop-blur-md hover:scale-[1.01] active:scale-[0.98] cursor-pointer rounded-[1.25rem] border-2 overflow-hidden"
      onClick={handleClick}
    >
      <div className={cn(
        "flex h-full w-20 shrink-0 items-center justify-center border-r-2 border-border/10 bg-muted/20 group-hover:bg-primary/5 transition-colors",
        color
      )}>
        {icon}
      </div>
      <div className="flex-1 flex flex-col items-start px-6 overflow-hidden text-left">
        <span className="truncate w-full leading-tight text-lg tracking-tight group-hover:text-primary transition-colors">{link.title}</span>
        {hostname && (
          <span className="text-[11px] text-muted-foreground font-bold opacity-40 truncate w-full mt-1 uppercase tracking-wider">
            {hostname}
          </span>
        )}
      </div>
      <div className="pr-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
         <ChevronRight className="h-5 w-5 text-primary" />
      </div>
    </Button>
  )
}
