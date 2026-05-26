import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from './logger'

// Mock console to capture output
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should emit a structured JSON log for info', async () => {
    await logger.info('Test info message', { extra: 'data' })
    
    expect(consoleSpy).toHaveBeenCalled()
    const lastCall = consoleSpy.mock.calls[0][0]
    const parsed = JSON.parse(lastCall)
    
    expect(parsed).toMatchObject({
      level: 'INFO',
      message: 'Test info message',
      context: expect.objectContaining({
        extra: 'data'
      })
    })
    expect(parsed.timestamp).toBeDefined()
  })

  it('should emit a structured JSON log for security', async () => {
    await logger.security('Security violation detected', { actorId: '123' })
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    const lastCall = consoleErrorSpy.mock.calls[0][0]
    const parsed = JSON.parse(lastCall)
    
    expect(parsed.level).toBe('SECURITY')
    expect(parsed.message).toBe('Security violation detected')
    expect(parsed.context.actorId).toBe('123')
  })

  it('should handle Error objects in context', async () => {
    const testError = new Error('Original error message')
    await logger.error('Failed operation', testError, { component: 'Auth' })
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    const lastCall = consoleErrorSpy.mock.calls[0][0]
    const parsed = JSON.parse(lastCall)
    
    expect(parsed.level).toBe('ERROR')
    expect(parsed.error.message).toBe('Original error message')
    expect(parsed.context.component).toBe('Auth')
  })

  it('should work with explicit request context', async () => {
    const mockRequest = {
      url: 'https://example.com/api/test',
      method: 'POST',
      headers: new Headers({
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'Mozilla/5.0'
      })
    } as unknown as Request

    await logger.info('API Call', { status: 200 }, mockRequest)
    
    expect(consoleSpy).toHaveBeenCalled()
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0])
    
    expect(parsed.context.path).toBe('/api/test')
    expect(parsed.context.method).toBe('POST')
    expect(parsed.context.userAgent).toBe('Mozilla/5.0')
  })
})
