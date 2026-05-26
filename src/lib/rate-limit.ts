import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env'

// In-memory fallback for local development if Upstash is not configured
const memoryCache = new Map<string, number>()

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
  type: 'global' | 'api' | 'auth' = 'global'
): Promise<RateLimitResult> {
  // Configurable limits per type
  const config = {
    global: { tokens: 100, window: '60 s' as const },
    api: { tokens: 30, window: '10 s' as const },
    auth: { tokens: 5, window: '60 s' as const },
  }

  const { tokens, window } = config[type]

  // Production / Staging: Use Upstash Redis
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })

    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics: true,
      prefix: `@avaliaprudente/ratelimit/${type}`,
    })

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
