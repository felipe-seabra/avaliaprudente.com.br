import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env'

// In-memory fallback for local development if Upstash is not configured
const memoryCache = new Map<string, number>()

type RateLimitType = 'global' | 'api' | 'auth'

interface RateLimiterConfig {
  tokens: number
  window: '60 s' | '10 s'
}

const rateLimitConfig: Record<RateLimitType, RateLimiterConfig> = {
  global: { tokens: 100, window: '60 s' },
  api: { tokens: 30, window: '10 s' },
  auth: { tokens: 5, window: '60 s' },
}

const distributedLimiters = new Map<RateLimitType, Ratelimit>()

function getDistributedRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null
  const existing = distributedLimiters.get(type)
  if (existing) return existing
  const { tokens, window } = rateLimitConfig[type]
  const limiter = new Ratelimit({
    redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: `@avaliaprudente/ratelimit/${type}`,
  })
  distributedLimiters.set(type, limiter)
  return limiter
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Distributed Rate Limiter using Upstash Redis (Edge compatible)
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'global'
): Promise<RateLimitResult> {
  const { tokens, window } = rateLimitConfig[type]
  const ratelimit = getDistributedRateLimiter(type)

  if (ratelimit) {
    const result = await ratelimit.limit(identifier)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  // Development/Test Fallback: Simple In-memory Limiter
  // NOTE: This is NOT effective in production serverless environments.
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    const now = Date.now()
    const windowMs = parseInt(window.split(' ')[0]) * 1000
    const key = `${type}:${identifier}`
    
    // This is a simplified version of the middleware logic, moved here for consistency
    const stats = memoryCache.get(key) || 0
    
    if (stats >= tokens) {
      return {
        success: false,
        limit: tokens,
        remaining: 0,
        reset: now + windowMs,
      }
    }

    memoryCache.set(key, stats + 1)
    
    // Clear cache periodically to prevent memory leak in dev
    setTimeout(() => memoryCache.delete(key), windowMs)

    return {
      success: true,
      limit: tokens,
      remaining: tokens - (stats + 1),
      reset: now + windowMs,
    }
  }

  // Production Safety: If Upstash is missing, we MUST fail open but log a critical warning
  // to avoid blocking all users, but the audit already identified this as a HIGH vulnerability.
  console.error(`[CRITICAL] Distributed rate limiting is NOT configured in ${process.env.NODE_ENV} environment.`)
  
  return {
    success: true,
    limit: tokens,
    remaining: tokens,
    reset: Date.now(),
  }
}
