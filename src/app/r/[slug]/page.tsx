import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { BusinessPageClient } from './business-page-client'
import { notFound } from 'next/navigation'
import { APP_CONFIG } from '@/lib/constants'

interface Props {
  params: Promise<{ slug: string }>
}

async function getBusinessData(slug: string) {
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  const linkRepo = new PageLinkRepository(supabase)
  const reviewRepo = new ReviewRepository(supabase)

  const page = await pageRepo.getBySlug(slug)
  if (!page) return null

  const [links, reviews] = await Promise.all([
    linkRepo.getByPageId(page.id),
    reviewRepo.getByBusinessId(page.business_id)
  ])

  return { page, links, reviews }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getBusinessData(slug)

  if (!data) {
    return {
      title: 'Página não encontrada | Avalia Prudente — Plataforma NFC',
    }
  }

  const { page } = data
  const businessName = page.businesses.name

  // Requirement: {Business Name} | Avalia Prudente — Plataforma NFC
  const title = `${businessName} | Avalia Prudente — Plataforma NFC`

  // Requirement: Business description OR contextual fallback
  const description = page.description && page.description.trim() !== ''
    ? page.description 
    : `Avaliações, contato e redes sociais da ${businessName} através da plataforma NFC da Avalia Prudente.`

  // Standardization: Use the new dynamic opengraph-image generator
  // Next.js automatically detects opengraph-image.tsx, but we can be explicit
  const ogImageUrl = `${APP_CONFIG.url}/r/${slug}/opengraph-image`

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_CONFIG.url}/r/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${APP_CONFIG.url}/r/${slug}`,
      siteName: 'Avalia Prudente',
      locale: 'pt_BR',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: businessName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}


export default async function BusinessPublicPage({ params }: Props) {
  const { slug } = await params
  const data = await getBusinessData(slug)

  if (!data) {
    notFound()
  }

  return <BusinessPageClient data={data} />
}
