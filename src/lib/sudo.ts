import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { env } from './env'

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

async function getSigningKey() {
  const secret = env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret-for-dev'
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
  return `${payload}.${signature}`
}

export async function verifySudoToken(token: string, expectedUserId: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const [userId, expStr, signature] = parts
    if (userId !== expectedUserId) return false
    
    const exp = parseInt(expStr, 10)
    if (Date.now() > exp) return false

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
    return isValid
  } catch (err) {
    console.error('[Sudo] Token verification failed:', err)
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

  return verifySudoToken(sudoToken, user.id)
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
}
