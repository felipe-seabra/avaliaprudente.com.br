# Operational Safety Guidance

This document defines the mandatory workflows for maintaining infrastructure stability and data integrity in the Avalia Prudente platform.

## 1. Database Safety & Migrations

### The Safety Guard
All destructive database operations are wrapped by `scripts/db-safety.sh`. This script detects if the target environment is remote (linked) and requires explicit confirmation.

**Mandatory Commands:**
- `npm run supabase:reset`: Local only. Wipes and re-seeds the local Docker database.
- `npm run db:push`: Pushes local migrations to the linked remote project. Always run `supabase db lint` before pushing.

### Safe Migration Flow
1. **Develop Local:** Create migrations using `supabase migration new <name>`.
2. **Validate Local:** Run `npm run supabase:reset` to ensure the migration applies cleanly to a fresh state and that seeds work.
3. **Test Rollback:** If possible, test the reversal of the schema change.
4. **CI Validation:** Ensure the migration doesn't break the build or tests in the PR.
5. **Production Push:** Only push migrations that have been fully validated in a local-first workflow.

## 2. Docker & Environment Maintenance

### Disk Usage
The Supabase Docker stack can consume significant disk space over time.
- `npm run docker:audit`: Check disk usage by Docker components.
- `npm run docker:clean`: Remove unused containers, networks, and images (Prune).

### Hard Reset (Panic Button)
If the local environment becomes inconsistent or the DB won't start:
- `npm run docker:reset-supa`: This stops all containers, removes volumes, and starts fresh. **Warning:** All local data will be lost.

## 3. Deployment Safety

### Environment Variables
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set for each environment.
- Use `src/lib/env.ts` for type-safe environment variable access.

### Pre-Deployment Checklist
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run test` passes all critical suites (especially middleware and auth).
- [ ] `npm run build` succeeds (validates SSR and Type Safety).
- [ ] Database migrations are synced with the target environment.

## 4. Multi-tenant Isolation Audit
Before any change to RLS or Repositories:
1. Verify that queries always include an `owner_id` or `business_id` filter.
2. Verify that RLS policies for `UPDATE` and `DELETE` strictly check `auth.uid() = owner_id`.
3. Ensure no infinite recursion is introduced by querying `profiles` inside RLS (use `is_admin()`).

## 5. Moderation & Governance Safety
1. **Admin Master Bypass:** Always ensure that `is_admin()` users can bypass blocks. Breaking this can lock out administrators.
2. **Appeals Workflow:** When reviewing an appeal, verify that the reversing action (e.g., unfreezing a business) is atomic and audited in `moderation_actions`.
3. **Onboarding Quality:** Any change to the business creation flow must respect the database-level quality constraints (slugs, required branding).
