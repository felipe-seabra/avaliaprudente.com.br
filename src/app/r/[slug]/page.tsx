import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BusinessPageRepository, PageLinkRepository } from '@/core/infrastructure/repositories/supabase-page-repository'
import { ReviewRepository } from '@/core/infrastructure/repositories/supabase-review-repository'
import { BusinessPageClient } from './business-page-client'
import { notFound } from 'next/navigation'
import { APP_CONFIG } from '@/lib/constants'
import { AlertTriangle, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Business, BusinessPage, PageLink, Review } from '@/core/domain/entities'
import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type PageWithBusiness = BusinessPage & { businesses: Business }

interface BusinessData {
  page: PageWithBusiness
  links: PageLink[]
  reviews: Review[]
  totalReviews: number
  currentPage: number
  isAdmin: boolean
  isOwner: boolean
  isReviewLink: boolean
  redirectUrl: string | null
}

async function getBusinessData(slug: string, pageNumber: number = 1): Promise<BusinessData | null> {
  const supabase = await createClient()
  const pageRepo = new BusinessPageRepository(supabase)
  const linkRepo = new PageLinkRepository(supabase)
  const reviewRepo = new ReviewRepository(supabase)

  const limit = 5
  const offset = (pageNumber - 1) * limit

  // Resolve Business Page by slug
  const page = await pageRepo.getBySlug(slug) as PageWithBusiness | null

  if (!page) return null

  // Check auth status
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  let isOwner = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = checkIsAdmin(profile?.role)
    
    // Check if user is owner of this business
    isOwner = page.businesses.owner_id === user.id
  }

  const [links, reviewsData] = await Promise.all([
    linkRepo.getByPageId(page.id),
    reviewRepo.getByBusinessId(page.business_id, limit, offset)
  ])

  return { 
    page, 
    links, 
    reviews: reviewsData.reviews,
    totalReviews: reviewsData.total,
    currentPage: pageNumber,
    isAdmin, 
    isOwner, 
    isReviewLink: false, 
    redirectUrl: null 
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sParams = await searchParams
  const pageParam = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  const data = await getBusinessData(slug, pageParam)

  if (!data || (data.page.businesses.is_frozen && !data.isAdmin)) {
    return {
      title: 'Página Indisponível | Avalia Prudente',
    }
  }

  // Handle unpublished pages
  if (!data.page.is_published && !data.isAdmin && !data.isOwner) {
    return {
      title: 'Página em Configuração | Avalia Prudente',
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BusinessPublicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sParams = await searchParams
  const pageParam = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  const data = await getBusinessData(slug, pageParam)

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

  // Handle unpublished pages for non-owners and non-admins
  if (!data.page.is_published && !data.isAdmin && !data.isOwner) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-background rounded-[2.5rem] p-10 shadow-xl border-2 border-primary/10 animate-in zoom-in-95 duration-500">
           <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Settings className="h-10 w-10" />
           </div>
           <h1 className="text-2xl font-black tracking-tight mb-2">Página em Configuração</h1>
           <p className="text-muted-foreground text-sm leading-relaxed mb-8">
             A página de <strong>{data.page.businesses.name}</strong> ainda está sendo configurada pelo proprietário. Em breve, você poderá ver as avaliações e links desta empresa.
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
