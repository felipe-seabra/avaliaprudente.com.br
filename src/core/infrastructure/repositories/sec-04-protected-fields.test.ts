import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { SupabaseClient } from '@supabase/supabase-js'
import { BusinessRepository } from './supabase-business-repository'
import { AdminRepository } from './supabase-admin-repository'
import { Business } from '@/core/domain/entities'

/**
 * SEC-04 Database Trigger Simulation
 * Exact reproduction of public.enforce_business_protected_fields() PL/pgSQL logic:
 *
 * BEGIN
 *   IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
 *     RETURN NEW;
 *   END IF;
 *   IF public.is_admin(auth.uid()) THEN
 *     RETURN NEW;
 *   END IF;
 *   IF (
 *     OLD.is_verified IS DISTINCT FROM NEW.is_verified OR
 *     OLD.verification_status IS DISTINCT FROM NEW.verification_status OR
 *     OLD.verified_at IS DISTINCT FROM NEW.verified_at OR
 *     OLD.verified_by IS DISTINCT FROM NEW.verified_by OR
 *     OLD.is_frozen IS DISTINCT FROM NEW.is_frozen OR
 *     OLD.plan_type IS DISTINCT FROM NEW.plan_type
 *   ) THEN
 *     RAISE EXCEPTION 'Permissão negada...' USING ERRCODE = '42501';
 *   END IF;
 *   RETURN NEW;
 * END;
 */
interface TriggerContext {
  authUid: string | null
  authRole: string | null
  userRoles: Record<string, string> // userId -> role ('customer' | 'admin' | 'super_admin')
}

interface TriggerError {
  code: string
  message: string
}

function evaluateProtectedFieldsTrigger(
  oldRow: Partial<Business>,
  newRow: Partial<Business>,
  context: TriggerContext
): { allowed: boolean; error?: TriggerError; result?: Partial<Business> } {
  // 1. Service role or system without authenticated user
  if (context.authUid === null || context.authRole === 'service_role') {
    return { allowed: true, result: { ...oldRow, ...newRow } }
  }

  // 2. Admin or super_admin
  const role = context.userRoles[context.authUid]
  const isAdmin = role === 'admin' || role === 'super_admin'
  if (isAdmin) {
    return { allowed: true, result: { ...oldRow, ...newRow } }
  }

  // 3. Check protected fields (IS DISTINCT FROM semantics)
  const isDistinct = (a: unknown, b: unknown) => {
    if (a === undefined && b === undefined) return false
    if (a === null && b === null) return false
    return a !== b
  }

  const protectedFields: (keyof Business)[] = [
    'is_verified',
    'verification_status',
    'verified_at',
    'verified_by',
    'is_frozen',
    'plan_type',
  ]

  for (const field of protectedFields) {
    if (newRow[field] !== undefined && isDistinct(oldRow[field], newRow[field])) {
      return {
        allowed: false,
        error: {
          code: '42501',
          message:
            'Permissão negada: apenas administradores podem alterar campos protegidos da empresa (is_verified, verification_status, verified_at, verified_by, is_frozen, plan_type).',
        },
      }
    }
  }

  return { allowed: true, result: { ...oldRow, ...newRow } }
}

describe('SEC-04: Protect Privileged Fields in public.businesses', () => {
  const initialBusiness: Partial<Business> = {
    id: 'biz-123',
    owner_id: 'owner-uuid-001',
    name: 'Padaria Modelo',
    slug: 'padaria-modelo',
    address: 'Rua Principal, 100',
    logo_url: 'https://storage/logo.png',
    is_verified: false,
    verification_status: 'pending',
    verified_at: null,
    verified_by: null,
    is_frozen: false,
    plan_type: 'free',
  }

  const frozenBusiness: Partial<Business> = {
    ...initialBusiness,
    id: 'biz-frozen-456',
    is_frozen: true,
  }

  describe('Phase 3: Migration File Integrity', () => {
    it('migration file exists and follows naming conventions', () => {
      const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations')
      const files = fs.readdirSync(migrationsDir)
      const sec04Migration = files.find((f) =>
        f.includes('protect_business_privileged_fields')
      )

      expect(sec04Migration).toBeDefined()
      expect(sec04Migration).toMatch(/^\d{14}_protect_business_privileged_fields\.sql$/)

      const content = fs.readFileSync(
        path.join(migrationsDir, sec04Migration!),
        'utf8'
      )
      expect(content).toContain('CREATE OR REPLACE FUNCTION public.enforce_business_protected_fields()')
      expect(content).toContain('SECURITY DEFINER SET search_path = public')
      expect(content).toContain('CREATE TRIGGER enforce_business_protected_fields_trigger')
      expect(content).toContain('BEFORE UPDATE ON public.businesses')
      expect(content).toContain('is_verified')
      expect(content).toContain('verification_status')
      expect(content).toContain('verified_at')
      expect(content).toContain('verified_by')
      expect(content).toContain('is_frozen')
      expect(content).toContain('plan_type')
      expect(content).toContain('public.is_admin(auth.uid())')
      expect(content).toContain("auth.role() = 'service_role'")
      expect(content).toContain("'42501'")
    })
  })

  describe('Phase 4: Security Boundary Verification', () => {
    const normalOwnerContext: TriggerContext = {
      authUid: 'owner-uuid-001',
      authRole: 'authenticated',
      userRoles: { 'owner-uuid-001': 'customer' },
    }

    const adminContext: TriggerContext = {
      authUid: 'admin-uuid-999',
      authRole: 'authenticated',
      userRoles: { 'admin-uuid-999': 'admin' },
    }

    const superAdminContext: TriggerContext = {
      authUid: 'superadmin-uuid-888',
      authRole: 'authenticated',
      userRoles: { 'superadmin-uuid-888': 'super_admin' },
    }

    // A. Normal authenticated business owner: Attempt is_verified = true -> REJECTED
    it('A. Normal owner attempt: is_verified = true is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { is_verified: true },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // B. Normal authenticated business owner: Attempt is_frozen = false -> REJECTED
    it('B. Normal owner attempt: is_frozen = false is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        frozenBusiness,
        { is_frozen: false },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // C. Normal authenticated business owner: Attempt plan_type = "pro" -> REJECTED
    it('C. Normal owner attempt: plan_type = "pro" is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { plan_type: 'pro' },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // D. Normal authenticated business owner: Attempt verified_by = attacker ID -> REJECTED
    it('D. Normal owner attempt: verified_by = attacker-controlled user ID is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { verified_by: 'attacker-uuid-666' },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // Additional: Normal owner attempt verification_status = "approved" -> REJECTED
    it('Normal owner attempt: verification_status = "approved" is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { verification_status: 'approved' },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // Additional: Normal owner attempt verified_at = timestamp -> REJECTED
    it('Normal owner attempt: verified_at = timestamp is REJECTED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { verified_at: new Date().toISOString() },
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(false)
      expect(evaluation.error?.code).toBe('42501')
      expect(evaluation.error?.message).toContain('Permissão negada')
    })

    // E. Normal authenticated business owner: Attempt to modify non-protected business fields -> ALLOWED
    it('E. Normal owner attempt: modify legitimate non-protected fields is ALLOWED', () => {
      const allowedUpdate = {
        name: 'Padaria Modelo Renovada',
        slug: 'padaria-modelo-renovada',
        address: 'Nova Avenida, 200',
        logo_url: 'https://storage/new-logo.png',
      }
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        allowedUpdate,
        normalOwnerContext
      )
      expect(evaluation.allowed).toBe(true)
      expect(evaluation.error).toBeUndefined()
      expect(evaluation.result?.name).toBe('Padaria Modelo Renovada')
      expect(evaluation.result?.slug).toBe('padaria-modelo-renovada')
      expect(evaluation.result?.address).toBe('Nova Avenida, 200')
      expect(evaluation.result?.logo_url).toBe('https://storage/new-logo.png')
      expect(evaluation.result?.is_verified).toBe(false)
    })

    // F. Administrator: Modify is_verified -> ALLOWED
    it('F. Administrator attempt: modify is_verified is ALLOWED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { is_verified: true, verification_status: 'approved' },
        adminContext
      )
      expect(evaluation.allowed).toBe(true)
      expect(evaluation.result?.is_verified).toBe(true)
    })

    // G. Administrator: Modify is_frozen -> ALLOWED
    it('G. Administrator attempt: modify is_frozen is ALLOWED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        frozenBusiness,
        { is_frozen: false },
        adminContext
      )
      expect(evaluation.allowed).toBe(true)
      expect(evaluation.result?.is_frozen).toBe(false)
    })

    // H. Administrator: Modify plan_type -> ALLOWED
    it('H. Administrator attempt: modify plan_type is ALLOWED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { plan_type: 'premium' },
        adminContext
      )
      expect(evaluation.allowed).toBe(true)
      expect(evaluation.result?.plan_type).toBe('premium')
    })

    // Super Administrator can also modify all protected fields
    it('Super Administrator attempt: modify protected fields is ALLOWED', () => {
      const evaluation = evaluateProtectedFieldsTrigger(
        initialBusiness,
        { is_verified: true, plan_type: 'enterprise', is_frozen: false },
        superAdminContext
      )
      expect(evaluation.allowed).toBe(true)
      expect(evaluation.result?.is_verified).toBe(true)
      expect(evaluation.result?.plan_type).toBe('enterprise')
    })

    // I. Verify that existing verification workflow still works
    it('I. Verification workflow: verify, reject, and remove operations work for admins', () => {
      // 1. Verify
      const verifyAction = evaluateProtectedFieldsTrigger(
        initialBusiness,
        {
          verification_status: 'approved',
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: 'admin-uuid-999',
        },
        adminContext
      )
      expect(verifyAction.allowed).toBe(true)
      expect(verifyAction.result?.is_verified).toBe(true)

      // 2. Reject
      const rejectAction = evaluateProtectedFieldsTrigger(
        initialBusiness,
        {
          verification_status: 'rejected',
          is_verified: false,
          verified_at: null,
          verified_by: null,
        },
        adminContext
      )
      expect(rejectAction.allowed).toBe(true)
      expect(rejectAction.result?.is_verified).toBe(false)

      // 3. Remove
      const removeAction = evaluateProtectedFieldsTrigger(
        verifyAction.result!,
        {
          verification_status: 'pending',
          is_verified: false,
          verified_at: null,
          verified_by: null,
        },
        adminContext
      )
      expect(removeAction.allowed).toBe(true)
      expect(removeAction.result?.is_verified).toBe(false)
      expect(removeAction.result?.verification_status).toBe('pending')
    })
  })

  describe('Phase 5: Security Regression Test (Direct API & Application Repository)', () => {
    let mockSupabase: unknown
    let dbState: Partial<Business>

    beforeEach(() => {
      dbState = { ...initialBusiness }

      const mockAuth = {
        getUser: vi.fn(),
      }

      const createUpdateHandler = (payload: Partial<Business>) => {
        const applyUpdate = async () => {
          const { data: userData } = await mockAuth.getUser()
          const currentRole = userData?.user?.user_metadata?.role || 'customer'
          const triggerResult = evaluateProtectedFieldsTrigger(
            dbState,
            payload,
            {
              authUid: userData?.user?.id || null,
              authRole: userData?.user ? 'authenticated' : null,
              userRoles: userData?.user ? { [userData.user.id]: currentRole } : {},
            }
          )

          if (!triggerResult.allowed) {
            return {
              data: null,
              error: triggerResult.error,
            }
          }

          dbState = { ...dbState, ...payload }
          return {
            data: { ...dbState },
            error: null,
          }
        }

        return {
          then: (
            resolve?: (value: { data: Partial<Business> | null; error: TriggerError | null }) => unknown,
            reject?: (reason: unknown) => unknown
          ) => applyUpdate().then(resolve, reject),
          eq: () => ({
            then: (
              resolve?: (value: { data: Partial<Business> | null; error: TriggerError | null }) => unknown,
              reject?: (reason: unknown) => unknown
            ) => applyUpdate().then(resolve, reject),
            select: () => ({
              single: () => applyUpdate(),
            }),
          }),
        }
      }

      mockSupabase = {
        auth: mockAuth,
        from: (table: string) => {
          if (table !== 'businesses') throw new Error(`Unexpected table: ${table}`)

          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: { ...dbState },
                  error: null,
                }),
              }),
            }),
            eq: () => ({
              single: async () => ({
                data: { ...dbState },
                error: null,
              }),
            }),
            single: async () => ({
              data: { ...dbState },
              error: null,
            }),
            update: (payload: Partial<Business>) => createUpdateHandler(payload),
          }
        },
        storage: {
          from: () => ({
            remove: async () => ({ data: [], error: null }),
          }),
        },
      }
    })

    it('blocks direct PostgREST attack updating is_verified=true from non-admin owner', async () => {
      const client = mockSupabase as {
        auth: { getUser: ReturnType<typeof vi.fn> }
        from: (table: string) => {
          update: (payload: Partial<Business>) => {
            eq: (col: string, val: string) => {
              select: () => {
                single: () => Promise<{ data: Partial<Business> | null; error: TriggerError | null }>
              }
            }
          }
        }
      }

      client.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-uuid-001', user_metadata: { role: 'customer' } } },
        error: null,
      })

      // Direct Supabase API attack: supabase.from('businesses').update({ is_verified: true })
      const { data, error } = await client
        .from('businesses')
        .update({ is_verified: true })
        .eq('id', 'biz-123')
        .select()
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error?.code).toBe('42501')
      expect(error?.message).toContain('Permissão negada')
      expect(dbState.is_verified).toBe(false)
    })

    it('blocks direct PostgREST attack unfreezing business from non-admin owner', async () => {
      dbState = { ...frozenBusiness }
      const client = mockSupabase as {
        auth: { getUser: ReturnType<typeof vi.fn> }
        from: (table: string) => {
          update: (payload: Partial<Business>) => {
            eq: (col: string, val: string) => {
              select: () => {
                single: () => Promise<{ data: Partial<Business> | null; error: TriggerError | null }>
              }
            }
          }
        }
      }

      client.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-uuid-001', user_metadata: { role: 'customer' } } },
        error: null,
      })

      // Direct Supabase API attack: supabase.from('businesses').update({ is_frozen: false })
      const { data, error } = await client
        .from('businesses')
        .update({ is_frozen: false })
        .eq('id', 'biz-frozen-456')
        .select()
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error?.code).toBe('42501')
      expect(dbState.is_frozen).toBe(true)
    })

    it('blocks application repository update when attempting to set plan_type="pro"', async () => {
      const client = mockSupabase as {
        auth: { getUser: ReturnType<typeof vi.fn> }
      }
      client.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-uuid-001', user_metadata: { role: 'customer' } } },
        error: null,
      })

      const repo = new BusinessRepository(mockSupabase as unknown as SupabaseClient)
      await expect(
        repo.update('biz-123', { plan_type: 'pro' } as Partial<Business>)
      ).rejects.toMatchObject({
        code: '42501',
      })
      expect(dbState.plan_type).toBe('free')
    })

    it('allows application repository update for legitimate business attributes', async () => {
      const client = mockSupabase as {
        auth: { getUser: ReturnType<typeof vi.fn> }
      }
      client.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-uuid-001', user_metadata: { role: 'customer' } } },
        error: null,
      })

      const repo = new BusinessRepository(mockSupabase as unknown as SupabaseClient)
      const updated = await repo.update('biz-123', {
        name: 'Padaria Modelo 2.0',
        address: 'Avenida Brasil, 500',
      })

      expect(updated.name).toBe('Padaria Modelo 2.0')
      expect(updated.address).toBe('Avenida Brasil, 500')
      expect(dbState.name).toBe('Padaria Modelo 2.0')
    })

    it('allows AdminRepository to verify business successfully', async () => {
      const client = mockSupabase as {
        auth: { getUser: ReturnType<typeof vi.fn> }
      }
      client.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-uuid-999', user_metadata: { role: 'admin' } } },
        error: null,
      })

      const adminRepo = new AdminRepository(mockSupabase as unknown as SupabaseClient)
      await adminRepo.verifyBusiness('biz-123')

      expect(dbState.is_verified).toBe(true)
      expect(dbState.verification_status).toBe('approved')
      expect(dbState.verified_by).toBe('admin-uuid-999')
    })
  })
})
