export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY'

interface LogContext {
  correlationId?: string
  actorId?: string
  path?: string
  method?: string
  ip?: string
  userAgent?: string
  requestId?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Structured logger for Edge-compatible security and operational observability.
 * Outputs JSON to console for ingestion by logging providers (Vercel, Datadog, etc.)
 */
class Logger {
  private async getBaseContext(req?: Request): Promise<LogContext> {
    try {
      if (req) {
        const { generatePrivacyFingerprint } = await import('./privacy')
        const forwardedFor = req.headers.get('x-forwarded-for')
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
        const userAgent = req.headers.get('user-agent') || 'unknown'
        const requestId = req.headers.get('x-vercel-id') || req.headers.get('x-request-id') || 'unknown'
        const url = new URL(req.url)

        return {
          ip: await generatePrivacyFingerprint(ip, userAgent, 'daily'),
          userAgent,
          requestId,
          path: url.pathname,
          method: req.method,
        }
      }

      if (typeof window !== 'undefined') {
        return {
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        }
      }

      // Dynamic import to avoid client-side build errors
      const { headers } = await import('next/headers')
      const { generatePrivacyFingerprint } = await import('./privacy')
      
      const headerList = await headers()
      const forwardedFor = headerList.get('x-forwarded-for')
      const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
      const userAgent = headerList.get('user-agent') || 'unknown'
      const requestId = headerList.get('x-vercel-id') || headerList.get('x-request-id') || 'unknown'
      
      const fingerprint = await generatePrivacyFingerprint(ip, userAgent, 'daily')

      return {
        ip: fingerprint,
        userAgent,
        requestId,
      }
    } catch {
      return {}
    }
  }

  private formatLog(level: LogLevel, message: string, context: LogContext, error?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: (error as Error & { code?: string }).code,
      }
    } else if (error) {
      entry.error = {
        message: String(error),
      }
    }

    return entry
  }

  private emit(entry: LogEntry) {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Cleaner client-side logs for dev
      const color = entry.level === 'ERROR' || entry.level === 'SECURITY' ? 'red' : entry.level === 'WARN' ? 'orange' : 'blue'
      console.log(`%c[${entry.level}] ${entry.message}`, `color: ${color}; font-weight: bold;`, entry.context, entry.error || '')
      return
    }

    const output = JSON.stringify(entry)
    
    switch (entry.level) {
      case 'ERROR':
      case 'SECURITY':
        console.error(output)
        break
      case 'WARN':
        console.warn(output)
        break
      default:
        console.log(output)
    }
  }

  async info(message: string, context: LogContext = {}, req?: Request) {
    const base = await this.getBaseContext(req)
    this.emit(this.formatLog('INFO', message, { ...base, ...context }))
  }

  async warn(message: string, context: LogContext = {}, req?: Request) {
    const base = await this.getBaseContext(req)
    this.emit(this.formatLog('WARN', message, { ...base, ...context }))
  }

  async error(message: string, error?: unknown, context: LogContext = {}, req?: Request) {
    const base = await this.getBaseContext(req)
    this.emit(this.formatLog('ERROR', message, { ...base, ...context }, error))
  }

  async security(message: string, context: LogContext = {}, req?: Request) {
    const base = await this.getBaseContext(req)
    this.emit(this.formatLog('SECURITY', message, { ...base, ...context }))
  }
}

export const logger = new Logger()
