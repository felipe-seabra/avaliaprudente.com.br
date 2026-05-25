import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  FINGERPRINT_PEPPER: z.string().min(16).optional(),
})

// Defensive parsing to avoid crashing during build if env vars are missing
const getEnv = () => {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      FINGERPRINT_PEPPER: process.env.FINGERPRINT_PEPPER,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      throw error
    }
    return {} as z.infer<typeof envSchema>
  }
}

export const env = getEnv()

export function validateEnv() {
  // During build (Next.js phases), we don't want to crash
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }

  try {
    envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((i) => i.path.join('.')).join(', ')
      console.error(`❌ Env validation failed: ${missing}`)
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Environment validation failed. Missing: ${missing}`)
      }
    }
  }
}
