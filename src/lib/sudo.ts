import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { env } from './env'
import { logger } from './logger'

// Web Crypto API helpers for edge-safe base64 conversion
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // Use btoa to create standard base64, then make it url-safe
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64ToBuffer(base64: string): ArrayBuffer {
  // Convert url-safe base64 back to standard
  let normalBase64 = base64.replace(/-/g, '+').replace(/_/g, '/')
  while (normalBase64.length % 4) {
    normalBase64 += '='
  }
  const binary_string = atob(normalBase64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

// Ephemeral in-memory key for non-production environments when no secret is configured
let devEphemeralSecret: string | null = null

function getDevEphemeralSecret(): string {
  if (!devEphemeralSecret) {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    devEphemeralSecret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  return devEphemeralSecret
}

/**
 * Reset dev ephemeral secret (for test isolation only)
 */
export function resetDevEphemeralSecretForTesting(): void {
  devEphemeralSecret = null
}

/**
 * Resolves the signing secret for Sudo tokens.
 * - Primary: Dedicated SUDO_SECRET (required in production, min 32 chars)
 * - Secondary fallback: SUPABASE_SERVICE_ROLE_KEY (non-preferred legacy fallback, logs warning in prod)
 * - Dev/Test: Ephemeral cryptographically secure random key (never deterministic or hardcoded)
 * - Production missing: Fails closed by throwing a fatal error
 */
export function resolveSudoSecret(): string {
  // 1. Preferred primary signing secret: dedicated SUDO_SECRET
  const dedicatedSecret = process.env.SUDO_SECRET || env.SUDO_SECRET
  if (dedicatedSecret && dedicatedSecret.trim().length >= 32) {
    return dedicatedSecret.trim()
  }

  // 2. Non-preferred secondary fallback: SUPABASE_SERVICE_ROLE_KEY
  const legacySecret = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  if (legacySecret && legacySecret.trim().length > 0) {
    return legacySecret.trim()
  }

  // 3. Fail-closed in production if no valid secret is configured
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[Sudo] Critical Security Error: SUDO_SECRET is required in production.')
  }

  // 4. Non-deterministic ephemeral key for dev/test
  return getDevEphemeralSecret()
}

async function getSigningKey() {
  const secret = resolveSudoSecret()

  const dedicatedSecret = process.env.SUDO_SECRET || env.SUDO_SECRET
  if (!dedicatedSecret && process.env.NODE_ENV === 'production') {
    await logger.warn('[Sudo] Using SUPABASE_SERVICE_ROLE_KEY as fallback for sudo tokens. Please configure dedicated SUDO_SECRET in production.')
  }

  const encoder = new TextEncoder()
  // Ensure the secret is at least 32 bytes by repeating it if necessary
  let paddedSecret = secret
  while (paddedSecret.length < 32) paddedSecret += secret
  
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(paddedSecret.substring(0, 32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signSudoToken(userId: string): Promise<string> {
  const key = await getSigningKey()
  const exp = Date.now() + 15 * 60 * 1000 // 15 mins
  const payload = `${userId}.${exp}`
  const encoder = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const signature = bufferToBase64(signatureBuffer)

  await logger.security('Sudo token generated', { actorId: userId })

  return `${payload}.${signature}`
}

export async function verifySudoToken(token: string, expectedUserId: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      await logger.security('Sudo verification failed: invalid token format', { actorId: expectedUserId })
      return false
    }
    
    const [userId, expStr, signature] = parts
    if (userId !== expectedUserId) {
      await logger.security('Sudo verification failed: user mismatch', { actorId: expectedUserId, tokenUserId: userId })
      return false
    }
    
    const exp = parseInt(expStr, 10)
    if (Date.now() > exp) {
      await logger.security('Sudo verification failed: token expired', { actorId: expectedUserId })
      return false
    }

    const key = await getSigningKey()
    const encoder = new TextEncoder()
    const payload = `${userId}.${expStr}`
    const signatureBuffer = base64ToBuffer(signature)
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payload)
    )

    if (!isValid) {
      await logger.security('Sudo verification failed: invalid signature', { actorId: expectedUserId })
    }

    return isValid
  } catch (err) {
    await logger.error('[Sudo] Token verification error', err, { actorId: expectedUserId })
    return false
  }
}

export async function checkSudo(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // 1. Check recent sign-in (less than 15 mins)
  if (user.last_sign_in_at) {
    const lastSignIn = new Date(user.last_sign_in_at).getTime()
    if (Date.now() - lastSignIn < 15 * 60 * 1000) {
      return true
    }
  }

  // 2. Check sudo token cookie
  const cookieStore = await cookies()
  const sudoToken = cookieStore.get('sudo_session')?.value
  if (!sudoToken) return false

  const isValid = await verifySudoToken(sudoToken, user.id)
  
  if (isValid) {
    await logger.info('Sudo mode verified via token', { actorId: user.id })
  }

  return isValid
}

export async function enableSudoMode(userId: string) {
  const token = await signSudoToken(userId)
  const cookieStore = await cookies()
  
  cookieStore.set('sudo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })

  await logger.security('Sudo mode enabled for user', { actorId: userId })
}
