import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin client using the Service Role key.
 * This client BYPASSES all RLS policies.
 * 
 * NEVER use this on the client side.
 * ONLY use this in Server Actions or API routes for administrative tasks.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase Admin environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
