import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { BusinessPageClient } from './business-page-client'
import { notFound } from 'next/navigation'
import { APP_CONFIG } from '@/lib/constants'
import { AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  // Check if user is admin to bypass frozen check in UI
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const [links, reviews] = await Promise.all([
    linkRepo.getByPageId(page.id),
    reviewRepo.getByBusinessId(page.business_id)
  ])

  return { page, links, reviews, isAdmin }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getBusinessData(slug)

  if (!data || (data.page.businesses.is_frozen && !data.isAdmin)) {
    return {
      title: 'Página Indisponível | Avalia Prudente',
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

  // Handle Frozen Business for non-admins
  if (data.page.businesses.is_frozen && !data.isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-background rounded-[2.5rem] p-10 shadow-xl border-2 border-destructive/10 animate-in zoom-in-95 duration-500">
           <div className="h-20 w-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10" />
           </div>
           <h1 className="text-2xl font-black tracking-tight mb-2">Empresa Indisponível</h1>
           <p className="text-muted-foreground text-sm leading-relaxed mb-8">
             A página de <strong>{data.page.businesses.name}</strong> está temporariamente suspensa por nossa equipe de moderação ou por solicitação do proprietário.
           </p>
           <div className="flex flex-col gap-3">
              <Link 
                href="/" 
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
                )}
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar para o Início
              </Link>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold pt-4">
                Avalia Prudente — Reputação Digital
              </p>
           </div>
        </div>
      </div>
    )
  }

  return <BusinessPageClient data={data} />
}
