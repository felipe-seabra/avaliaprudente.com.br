import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  it('should allow requests within limits in development', async () => {
    // In dev mode (default for vitest if not overridden), it uses in-memory
    const identifier = 'test-ip-1'
    
    // Global limit is 100
    for (let i = 0; i < 100; i++) {
      const result = await checkRateLimit(identifier, 'global')
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(100 - (i + 1))
    }

    // 101st request should fail
    const result = await checkRateLimit(identifier, 'global')
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should respect different tiers', async () => {
    const identifier = 'test-ip-2'
    
    // Auth limit is 5
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(identifier, 'auth')
      expect(result.success).toBe(true)
    }

    const result = await checkRateLimit(identifier, 'auth')
    expect(result.success).toBe(false)
  })

  it('should reset after window expires', async () => {
    const identifier = 'test-ip-3'
    
    // Consume auth limit
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(identifier, 'auth')
    }
    
    expect((await checkRateLimit(identifier, 'auth')).success).toBe(false)

    // Advance time by 61 seconds (window is 60s)
    vi.advanceTimersByTime(61000)

    expect((await checkRateLimit(identifier, 'auth')).success).toBe(true)
  })
})
