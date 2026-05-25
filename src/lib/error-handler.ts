import { logger } from './logger'

/**
 * Utility to normalize and parse errors from various sources (Supabase, Auth, DB, etc.)
 * into human-readable messages in Portuguese.
 */

export interface NormalizedError {
  message: string
  code?: string
  originalError?: unknown
}

export function parseError(error: unknown): NormalizedError {
  // If it's already a string, wrap it
  if (typeof error === 'string') {
    return { message: error }
  }

  // Handle common error objects
  const err = error as Record<string, unknown>

  if (err?.message && typeof err.message === 'string') {
    const message = err.message.toLowerCase()

    // Auth specific errors
    if (message.includes('invalid login credentials')) {
      return { message: 'E-mail ou senha incorretos.', code: 'auth/invalid-credentials' }
    }
    if (message.includes('user already registered')) {
      return { message: 'Este e-mail já está cadastrado.', code: 'auth/user-exists' }
    }
    if (message.includes('password is too short')) {
      return { message: 'A senha deve ter pelo menos 6 caracteres.', code: 'auth/weak-password' }
    }
    if (message.includes('email not confirmed')) {
      return { message: 'Por favor, confirme seu e-mail antes de entrar.', code: 'auth/email-not-confirmed' }
    }

    // DB specific errors (RLS, Constraints)
    if (message.includes('row-level security policy')) {
      return { message: 'Você não tem permissão para realizar esta ação.', code: 'db/rls-violation' }
    }
    if (message.includes('unique constraint') || message.includes('already exists')) {
      if (message.includes('slug')) {
        return { message: 'Este endereço (slug) já está em uso.', code: 'db/duplicate-slug' }
      }
      return { message: 'Este registro já existe.', code: 'db/duplicate' }
    }

    // Network / Generic
    if (message.includes('fetch') || message.includes('network')) {
      return { message: 'Erro de conexão. Verifique sua internet.', code: 'network/failure' }
    }

    // Default to the original message but translated if common
    return { 
      message: err.message || 'Ocorreu um erro inesperado. Tente novamente.',
      code: (err.code as string) || 'unknown',
      originalError: error
    }
  }

  return { 
    message: 'Ocorreu um erro desconhecido.', 
    code: 'unknown',
    originalError: error 
  }
}

/**
 * Logs errors with structured context.
 */
export async function logError(error: unknown, context?: string) {
  const normalized = parseError(error)
  
  if (normalized.code?.startsWith('auth/') || normalized.code?.startsWith('db/rls')) {
    await logger.security(`Security error in ${context || 'Unknown'}`, {
      errorCode: normalized.code,
      context,
    })
  } else {
    await logger.error(`Error in ${context || 'Unknown'}`, error, {
      errorCode: normalized.code,
      context,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.group(`[DEBUG] Error in ${context || 'Unknown Context'}`)
    console.error('Original Error:', error)
    console.info('Parsed Message:', normalized.message)
    console.groupEnd()
  }
}
