import { Metadata } from 'next'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
import { unstable_cache } from 'next/cache'

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

/**
 * Pure function to fetch public business data using an anonymous client.
 * This is safe to be used inside unstable_cache.
 */
async function fetchPublicBusinessData(slug: string, pageNumber: number = 1) {
  console.log('[DEBUG FLOW 2] fetchPublicBusinessData called with slug:', slug, 'pageNumber:', pageNumber)
  const supabase = createAdminClient()
  const pageRepo = new BusinessPageRepository(supabase)
  const linkRepo = new PageLinkRepository(supabase)
  const reviewRepo = new ReviewRepository(supabase)

  const limit = 5
  const offset = (pageNumber - 1) * limit

  // Resolve Business Page by slug
  console.log('[DEBUG FLOW 3] Calling pageRepo.getBySlug with slug:', slug)
  const page = await pageRepo.getBySlug(slug) as PageWithBusiness | null
  console.log('[DEBUG FLOW 5] pageRepo.getBySlug returned page:', page)

  if (!page) {
    console.log('[DEBUG FLOW 5a] pageRepo.getBySlug returned null, fetchPublicBusinessData returning null')
    return null
  }

  const [links, reviewsResponse] = await Promise.all([
    linkRepo.getByPageId(page.id),
    reviewRepo.getByBusinessId(page.business_id, limit, offset)
  ])

  console.log('[DEBUG FLOW 5b] fetchPublicBusinessData successfully fetched page and links/reviews')
  return { 
    page, 
    links, 
    reviews: reviewsResponse.data,
    totalReviews: reviewsResponse.total,
    currentPage: pageNumber
  }
}

/**
 * Check authentication status and administrative privileges.
 * This MUST NOT be cached by unstable_cache as it depends on cookies.
 */
async function getAuthStatus(ownerId?: string): Promise<{ isAdmin: boolean; isOwner: boolean }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { isAdmin: false, isOwner: false }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return {
      isAdmin: checkIsAdmin(profile?.role),
      isOwner: ownerId === user.id
    }
  } catch (error) {
    console.error('[Auth] Error checking auth status:', error)
    return { isAdmin: false, isOwner: false }
  }
}

/**
 * Cached version of fetchPublicBusinessData using Next.js unstable_cache.
 * Supports targeted invalidation using the slug-specific tag.
 */
const getBusinessData = (slug: string, pageNumber: number = 1) => 
  unstable_cache(
    async () => fetchPublicBusinessData(slug, pageNumber),
    [`business-page-${slug}`, `page-${pageNumber}`],
    {
      revalidate: 3600,
      tags: [`business-page-${slug}`]
    }
  )()

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sParams = await searchParams
  const pageParam = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  
  // Fetch public data (cached)
  console.log('[DEBUG METADATA] generateMetadata calling getBusinessData with slug:', slug, 'pageParam:', pageParam)
  const data = await getBusinessData(slug, pageParam)
  console.log('[DEBUG METADATA] generateMetadata getBusinessData returned data:', data)

  if (!data) {
    console.log('[DEBUG METADATA] generateMetadata no data found for slug:', slug)
    return {
      title: 'Página Indisponível | Avalia Prudente',
    }
  }

  // Check auth status (dynamic, not cached)
  const { isAdmin, isOwner } = await getAuthStatus(data.page.businesses.owner_id)

  // Handle Frozen Business
  if (data.page.businesses.is_frozen && !isAdmin) {
    return {
      title: 'Página Indisponível | Avalia Prudente',
    }
  }

  // Handle unpublished pages
  if (!data.page.is_published && !isAdmin && !isOwner) {
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
  console.log('[DEBUG FLOW 1] BusinessPublicPage entry. Slug from params:', slug)
  const sParams = await searchParams
  const pageParam = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1
  
  // 1. Fetch public data (cached)
  console.log('[DEBUG FLOW 1a] Calling getBusinessData with slug:', slug, 'pageParam:', pageParam)
  const publicData = await getBusinessData(slug, pageParam)
  console.log('[DEBUG FLOW 6] getBusinessData returned publicData:', publicData)

  if (!publicData) {
    console.log('[DEBUG FLOW 6a] publicData is null, calling notFound()')
    notFound()
  }

  // 2. Fetch auth status (dynamic, depends on cookies)
  const { isAdmin, isOwner } = await getAuthStatus(publicData.page.businesses.owner_id)

  // 3. Combine data for the client component
  const data: BusinessData = {
    ...publicData,
    isAdmin,
    isOwner,
    isReviewLink: false,
    redirectUrl: null
  }

  // Handle Frozen Business for non-admins
  if (data.page.businesses.is_frozen && !isAdmin) {
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
  if (!data.page.is_published && !isAdmin && !isOwner) {
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
