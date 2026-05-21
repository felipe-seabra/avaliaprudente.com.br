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

## 6. Anti-Spam & Abuse Prevention

The platform implements a hybrid protection system to prevent rating inflation and spam reviews.

### Review Cooldown Rules
- **Authenticated Submission:** New review submissions require Supabase Auth through Google OAuth or Magic Link before the trusted server-side API writes to `reviews`.
- **Per-Business Throttling:** A single device/browser (identified by an anonymous fingerprint) can only review the same business once every **60 minutes**.
- **Content Deduplication:** Identical review text from the same fingerprint is blocked across any business for **10 minutes**.

## 7. Analytics Anti-Inflation

To preserve ranking integrity and metric accuracy, the platform deduplicates analytics signals.

### Throttling Rules
- **View/Click Cooldown:** Repeated events of the same type (`page_visit`, `cta_click`) for the same business from the same fingerprint are ignored if they occur within **15 minutes** of each other.
- **Server-side Silencing:** Deduplication is handled by the `tr_enforce_analytics_deduplication` trigger, which silently drops duplicate insertions without affecting user experience.

### Privacy & Fingerprinting
- Uses the same anonymous SHA-256 fingerprinting system as the Anti-Spam protection.
- No personal data or raw IPs are stored in the analytics pipeline.

### Implementation Details
- **Authenticated Identity:** New reviews store `user_id`, `display_name`, and minimal `auth_provider` metadata for moderation and lawful attribution. Public UI displays only `display_name`.
- **Anonymous Fingerprinting:** Uses a SHA-256 hash of stable browser characteristics (User Agent, timezone, screen resolution) combined with anonymized network signals. Raw IPs are NOT stored to preserve user privacy.
- **Server-side Enforcement:** Protection is enforced via database triggers (`tr_enforce_review_abuse_protection`) on the `reviews` table. Frontend-only checks are never the sole protection.
- **Shared Network Support:** The system is designed to avoid blocking legitimate users on shared Wi-Fi (offices, homes) by combining multiple heuristics instead of a simple IP lock.
