'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  MessageCircle, 
  Globe, 
  Briefcase, 
  Link as LinkIcon,
  Camera,
  Share2
} from 'lucide-react'
import { PageLink } from '@/core/domain/entities'
import { AnalyticsRepository } from '@/core/infrastructure/repositories/supabase-analytics-repository'

interface CTAButtonProps {
  link: PageLink
  businessId: string
  onClick?: () => void
}

export function CTAButton({ link, businessId, onClick }: CTAButtonProps) {
  const analyticsRepo = useMemo(() => new AnalyticsRepository(), [])

  const getIcon = () => {
    switch (link.type) {
      case 'google_review': return <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />
      case 'instagram': return <Camera className="h-5 w-5" />
      case 'facebook': return <Share2 className="h-5 w-5" />
      case 'website': return <Globe className="h-5 w-5" />
      case 'portfolio': return <Briefcase className="h-5 w-5" />
      default: return <LinkIcon className="h-5 w-5" />
    }
  }

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
      window.open(link.url, '_blank')
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full h-16 justify-start gap-4 px-6 text-lg font-medium shadow-sm hover:shadow-md transition-all hover:border-primary/50 group bg-card hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
        {getIcon()}
      </div>
      <span className="truncate">{link.title}</span>
    </Button>
  )
}
