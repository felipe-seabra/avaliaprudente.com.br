import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { validateCSRF, generateSecurityHeaders } from './security'

describe('Security Utilities', () => {
  describe('validateCSRF', () => {
    it('should allow GET, HEAD, OPTIONS methods without Origin', () => {
      const methods = ['GET', 'HEAD', 'OPTIONS']
      methods.forEach(method => {
        const req = new NextRequest('http://localhost/api/test', { method })
        expect(validateCSRF(req)).toBe(true)
      })
    })

    it('should reject POST without Origin header', () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: { host: 'localhost' }
      })
      expect(validateCSRF(req)).toBe(false)
    })

    it('should allow POST with matching Origin and Host', () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://localhost',
          host: 'localhost'
        }
      })
      expect(validateCSRF(req)).toBe(true)
    })

    it('should reject POST with mismatched Origin and Host', () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://attacker.com',
          host: 'localhost'
        }
      })
      expect(validateCSRF(req)).toBe(false)
    })

    it('should respect X-Forwarded-Host if available', () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          origin: 'https://avaliaprudente.com.br',
          host: 'localhost',
          'x-forwarded-host': 'avaliaprudente.com.br'
        }
      })
      expect(validateCSRF(req)).toBe(true)
    })

    it('should reject invalid Origin format', () => {
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          origin: 'invalid-url',
          host: 'localhost'
        }
      })
      expect(validateCSRF(req)).toBe(false)
    })
  })

  describe('generateSecurityHeaders', () => {
    it('should return expected security headers', () => {
      const headers = generateSecurityHeaders()
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'")
    })
  })
})