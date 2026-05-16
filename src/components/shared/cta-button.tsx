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
    const url = link.url.toLowerCase()

    // 1. Explicit Type Mapping
    if (type === 'google_review') return { icon: <BrandIcons.Google size={20} />, color: 'text-[#4285F4]' }
    if (type === 'whatsapp' || url.includes('wa.me') || url.includes('whatsapp.com')) 
      return { icon: <BrandIcons.WhatsApp size={22} />, color: 'text-[#25D366]' }
    if (type === 'instagram' || url.includes('instagram.com')) 
      return { icon: <BrandIcons.Instagram size={20} />, color: 'text-[#E4405F]' }
    if (type === 'facebook' || url.includes('facebook.com')) 
      return { icon: <BrandIcons.Facebook size={20} />, color: 'text-[#1877F2]' }
    if (type === 'tiktok' || url.includes('tiktok.com')) 
      return { icon: <BrandIcons.TikTok size={20} />, color: 'text-[#000000] dark:text-white' }
    if (type === 'youtube' || url.includes('youtube.com')) 
      return { icon: <BrandIcons.YouTube size={20} />, color: 'text-[#FF0000]' }
    if (type === 'linkedin' || url.includes('linkedin.com')) 
      return { icon: <BrandIcons.LinkedIn size={20} />, color: 'text-[#0A66C2]' }
    if (type === 'twitter' || type === 'x' || url.includes('twitter.com') || url.includes('x.com')) 
      return { icon: <BrandIcons.Twitter size={18} />, color: 'text-[#000000] dark:text-white' }
    if (type === 'telegram' || url.includes('t.me')) 
      return { icon: <BrandIcons.Telegram size={20} />, color: 'text-[#24A1DE]' }
    if (type === 'discord' || url.includes('discord.gg')) 
      return { icon: <BrandIcons.Discord size={20} />, color: 'text-[#5865F2]' }
    
    // 2. Utility / Action Mapping
    if (url.startsWith('tel:')) return { icon: <Phone size={20} />, color: 'text-blue-500' }
    if (url.startsWith('mailto:')) return { icon: <Mail size={20} />, color: 'text-orange-500' }
    if (url.includes('maps.google') || url.includes('goo.gl/maps')) 
      return { icon: <MapPin size={20} />, color: 'text-red-500' }

    // 3. Fallbacks
    if (type === 'website') return { icon: <Globe size={20} />, color: 'text-primary' }
    if (type === 'portfolio') return { icon: <Briefcase size={20} />, color: 'text-primary' }
    
    return { icon: <LinkIcon size={20} />, color: 'text-muted-foreground' }
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
    } else {
      const url = link.url.startsWith('http') || link.url.startsWith('tel:') || link.url.startsWith('mailto:')
        ? link.url
        : `https://${link.url}`
      window.open(url, '_blank')
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full h-[72px] justify-start gap-5 px-5 text-base font-bold shadow-sm hover:shadow-md transition-all hover:border-primary/40 group bg-background/80 backdrop-blur-sm hover:scale-[1.01] active:scale-[0.98] cursor-pointer rounded-2xl border-2"
      onClick={handleClick}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors border border-transparent group-hover:border-primary/10",
        color
      )}>
        {icon}
      </div>
      <div className="flex flex-col items-start overflow-hidden">
        <span className="truncate w-full leading-tight">{link.title}</span>
        {link.url && !link.url.startsWith('tel:') && !link.url.startsWith('mailto:') && (
          <span className="text-[10px] text-muted-foreground font-medium opacity-60 truncate w-full mt-1">
            {new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname}
          </span>
        )}
      </div>
    </Button>
  )
}
