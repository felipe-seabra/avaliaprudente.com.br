import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generatePrivacyFingerprint, sanitizeUserAgent, resolvePrivacyPepper, resetDevEphemeralPepperForTesting } from './privacy'

describe('Privacy Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    resetDevEphemeralPepperForTesting()
  })

  afterEach(() => {
    process.env = originalEnv
    resetDevEphemeralPepperForTesting()
  })

  describe('generatePrivacyFingerprint', () => {
    const ip = '192.168.1.1'
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

    it('should generate a deterministic hash within runtime process', async () => {
      const h1 = await generatePrivacyFingerprint(ip, ua)
      const h2 = await generatePrivacyFingerprint(ip, ua)
      expect(h1).toBe(h2)
      expect(h1).toHaveLength(64) // SHA-256 hex
    })

    it('should change hash if IP changes', async () => {
      const h1 = await generatePrivacyFingerprint(ip, ua)
      const h2 = await generatePrivacyFingerprint('1.1.1.1', ua)
      expect(h1).not.toBe(h2)
    })

    it('should change hash if User Agent changes', async () => {
      const h1 = await generatePrivacyFingerprint(ip, ua)
      const h2 = await generatePrivacyFingerprint(ip, 'different-ua')
      expect(h1).not.toBe(h2)
    })

    it('should include daily rotation by default', async () => {
      const h1 = await generatePrivacyFingerprint(ip, ua, 'daily')
      expect(h1).toBeDefined()
    })
  })

  describe('SEC-09: resolvePrivacyPepper security controls', () => {
    it('should resolve configured FINGERPRINT_PEPPER when valid', () => {
      const testPepper = 'custom-secure-pepper-min-32-chars-long-12345'
      process.env.FINGERPRINT_PEPPER = testPepper
      expect(resolvePrivacyPepper()).toBe(testPepper)
    })

    it('should fail closed (throw error) in production if FINGERPRINT_PEPPER is missing', () => {
      vi.stubEnv('NODE_ENV', 'production')
      delete process.env.FINGERPRINT_PEPPER

      expect(() => resolvePrivacyPepper()).toThrow(/FINGERPRINT_PEPPER is required in production/)
    })

    it('should never use hardcoded deterministic string "fallback-secure-pepper-for-dev-only"', () => {
      delete process.env.FINGERPRINT_PEPPER
      const pepper1 = resolvePrivacyPepper()
      expect(pepper1).not.toBe('fallback-secure-pepper-for-dev-only')
      expect(pepper1).toHaveLength(64) // 32 bytes hex

      // Reset and verify new random pepper is distinct across process lifecycles
      resetDevEphemeralPepperForTesting()
      const pepper2 = resolvePrivacyPepper()
      expect(pepper2).not.toBe(pepper1)
      expect(pepper2).not.toBe('fallback-secure-pepper-for-dev-only')
    })
  })

  describe('sanitizeUserAgent', () => {
    it('should extract browser and OS', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      const sanitized = sanitizeUserAgent(ua)
      expect(sanitized).toBe('Chrome on Macintosh')
    })

    it('should handle mobile user agents', async () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      const sanitized = sanitizeUserAgent(ua)
      expect(sanitized).toBe('Safari on iPhone')
    })

    it('should handle unknown agents gracefully', () => {
      expect(sanitizeUserAgent('')).toBe('Unknown')
      expect(sanitizeUserAgent('bot')).toBe('Unknown on Unknown')
    })
  })
})
