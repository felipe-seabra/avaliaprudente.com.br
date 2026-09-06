import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  signSudoToken,
  verifySudoToken,
  resolveSudoSecret,
  resetDevEphemeralSecretForTesting,
} from './sudo'

// Mock next/headers for sudo cookie testing
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock logger to verify security logs and avoid clutter
vi.mock('./logger', () => ({
  logger: {
    security: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SEC-08: Sudo Mode Security & Secret Hardening', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    resetDevEphemeralSecretForTesting()
  })

  afterEach(() => {
    process.env = originalEnv
    resetDevEphemeralSecretForTesting()
  })

  describe('resolveSudoSecret', () => {
    it('should resolve dedicated SUDO_SECRET when configured with at least 32 chars', () => {
      const dedicatedSecret = 'dedicated-sudo-secret-32-chars-long-abc123'
      process.env.SUDO_SECRET = dedicatedSecret
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-should-be-ignored'

      expect(resolveSudoSecret()).toBe(dedicatedSecret)
    })

    it('should explicitly verify that SUPABASE_SERVICE_ROLE_KEY alone is insufficient in production', () => {
      vi.stubEnv('NODE_ENV', 'production')
      delete process.env.SUDO_SECRET
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret-that-must-never-be-used-for-sudo'

      // In production, SUPABASE_SERVICE_ROLE_KEY alone must fail closed
      expect(() => resolveSudoSecret()).toThrow(/SUDO_SECRET is required in production/)
    })

    it('should explicitly verify that SUPABASE_SERVICE_ROLE_KEY alone is not used in dev/test (uses ephemeral key)', () => {
      delete process.env.SUDO_SECRET
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-present-in-dev'

      const resolved = resolveSudoSecret()
      // Must not use SUPABASE_SERVICE_ROLE_KEY
      expect(resolved).not.toBe('service-role-key-present-in-dev')
      expect(resolved).toHaveLength(64) // 32 random bytes in hex
    })

    it('should fail closed in production if SUDO_SECRET is less than 32 chars even if SUPABASE_SERVICE_ROLE_KEY is set', () => {
      vi.stubEnv('NODE_ENV', 'production')
      process.env.SUDO_SECRET = 'short-secret-under-32-chars'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-should-not-be-used'

      expect(() => resolveSudoSecret()).toThrow(/SUDO_SECRET is required in production/)
    })

    it('should never use hardcoded deterministic string "fallback-secret-for-dev"', () => {
      delete process.env.SUDO_SECRET
      delete process.env.SUPABASE_SERVICE_ROLE_KEY

      const secret1 = resolveSudoSecret()
      expect(secret1).not.toBe('fallback-secret-for-dev')
      expect(secret1).toHaveLength(64) // 32 random bytes in hex

      // Reset and verify new random secret is generated (non-deterministic)
      resetDevEphemeralSecretForTesting()
      const secret2 = resolveSudoSecret()
      expect(secret2).not.toBe(secret1)
      expect(secret2).not.toBe('fallback-secret-for-dev')
    })
  })

  describe('signSudoToken & verifySudoToken lifecycle', () => {
    const userId = 'user-uuid-1234-5678'
    const sudoSecret = 'test-sudo-secret-32-characters-long-key'

    beforeEach(() => {
      process.env.SUDO_SECRET = sudoSecret
    })

    it('should sign and verify valid sudo token', async () => {
      const token = await signSudoToken(userId)
      expect(token).toBeDefined()
      expect(token.split('.')).toHaveLength(3)

      const isValid = await verifySudoToken(token, userId)
      expect(isValid).toBe(true)
    })

    it('should reject token if userId mismatches', async () => {
      const token = await signSudoToken(userId)
      const isValid = await verifySudoToken(token, 'attacker-uuid-9999')
      expect(isValid).toBe(false)
    })

    it('should reject expired sudo token', async () => {
      // Create a token expired 1 minute ago
      const expiredTime = Date.now() - 60000
      const payload = `${userId}.${expiredTime}`
      
      const encoder = new TextEncoder()
      let paddedSecret = sudoSecret
      while (paddedSecret.length < 32) paddedSecret += sudoSecret
      
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(paddedSecret.substring(0, 32)),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
      
      // base64Url
      let binary = ''
      const bytes = new Uint8Array(signatureBuffer)
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      const signature = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      const expiredToken = `${payload}.${signature}`

      const isValid = await verifySudoToken(expiredToken, userId)
      expect(isValid).toBe(false)
    })

    it('should reject forged tokens signed with legacy hardcoded secret "fallback-secret-for-dev"', async () => {
      const legacyFallback = 'fallback-secret-for-dev'
      const exp = Date.now() + 15 * 60 * 1000
      const payload = `${userId}.${exp}`

      let paddedSecret = legacyFallback
      while (paddedSecret.length < 32) paddedSecret += legacyFallback

      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(paddedSecret.substring(0, 32)),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))

      let binary = ''
      const bytes = new Uint8Array(signatureBuffer)
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      const signature = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      const forgedToken = `${payload}.${signature}`

      // Verification must fail because the server uses dedicated SUDO_SECRET (or ephemeral random key)
      const isValid = await verifySudoToken(forgedToken, userId)
      expect(isValid).toBe(false)
    })

    it('should reject malformed tokens with invalid format or tampered signature', async () => {
      expect(await verifySudoToken('invalid', userId)).toBe(false)
      expect(await verifySudoToken('user.1234', userId)).toBe(false)
      expect(await verifySudoToken('user.1234.sig.extra', userId)).toBe(false)
      expect(await verifySudoToken('', userId)).toBe(false)

      const validToken = await signSudoToken(userId)
      const parts = validToken.split('.')
      // Tamper signature
      const tamperedToken = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -4)}XXXX`
      expect(await verifySudoToken(tamperedToken, userId)).toBe(false)
    })

    it('should fail closed and return false if SUDO_SECRET is missing in production even when SUPABASE_SERVICE_ROLE_KEY is set', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      delete process.env.SUDO_SECRET
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-present-but-must-not-enable-sudo'

      // verifySudoToken should fail closed, log error, and return false
      const isValid = await verifySudoToken('user.123456789.fakesig', userId)
      expect(isValid).toBe(false)
    })
  })
})
