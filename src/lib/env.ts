import { z } from 'zod'

const baseEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SUDO_SECRET: z.string().min(32).optional(),
  FINGERPRINT_PEPPER: z.string().min(32).optional(),
})

// Production schema: enforce dedicated SUDO_SECRET and FINGERPRINT_PEPPER with strict entropy
const productionEnvSchema = baseEnvSchema.extend({
  SUDO_SECRET: z.string().min(32, 'SUDO_SECRET must be at least 32 characters in production'),
  FINGERPRINT_PEPPER: z.string().min(32, 'FINGERPRINT_PEPPER must be at least 32 characters in production'),
})

// Defensive parsing to avoid crashing during build if env vars are missing
const getEnv = () => {
  try {
    const isProd = process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE
    const schema = isProd ? productionEnvSchema : baseEnvSchema
    return schema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      SUDO_SECRET: process.env.SUDO_SECRET,
      FINGERPRINT_PEPPER: process.env.FINGERPRINT_PEPPER,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      throw error
    }
    return {} as z.infer<typeof baseEnvSchema>
  }
}

export const env = getEnv()

export function validateEnv() {
  // During build (Next.js phases), we don't want to crash
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }

  try {
    const isProd = process.env.NODE_ENV === 'production'
    const schema = isProd ? productionEnvSchema : baseEnvSchema
    schema.parse(process.env)
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
