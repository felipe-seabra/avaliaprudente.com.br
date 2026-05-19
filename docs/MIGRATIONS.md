## Database Migrations

This document tracks and explains all database schema changes.

### Safe Migration Workflow (MANDATORY)

To prevent accidental data loss in remote/production environments, follow this strictly:

1. **Local Development:** Work exclusively in the local Docker environment.
   ```bash
   npm run supabase:migration your_feature_name
   ```
2. **Schema Validation:** Ensure the database can be rebuilt from scratch.
   ```bash
   npm run supabase:reset
   ```
   *You must confirm that local tests pass before proceeding.*
3. **Migration Review (PR Stage):** Before merging to `main`, ensure that your pull request has been validated in the CI pipeline. Migrations should be peer-reviewed for syntax and safety.
4. **Staging Verification:** Run `npx supabase db push` against the Staging environment before executing in Production. Test the application against this new schema.
5. **Deployment to Cloud:** Only push to the linked production project AFTER staging validation.
   ```bash
   npm run db:push
   ```
   *The **Safety Guard** will ask for confirmation if a remote project is detected.*

### Branch Strategy & Safe Merge Workflow

- **`main`**: The single source of truth for production. Protected branch. Requires passing status checks (lint, build, test).
- **Feature Branches**: Created from `main` (e.g., `feature/moderation-ui`). Must be merged via Pull Requests.
- **Hotfix Branches**: Created from `main` for critical bugs (e.g., `hotfix/rls-recursion`).

Quando lidar com migrações de banco em Pull Requests, sempre teste o upgrade E o rollback localmente se possível.

---

## [20260519100000 - 20260519140000] Moderation Appeals, Quality Enforcement & Stability

### Purpose
Completes the moderation lifecycle with an appeals system and enforces data quality during the business onboarding process. Also stabilizes business slug uniqueness and profile update triggers.

### Affected Tables
- `public.moderation_appeals`: Created to track user contests against sanctions.
- `public.businesses`: Enforced unique slugs and added quality check constraints.
- `public.profiles`: Stabilized triggers for metadata persistence.

### Key Features
- **Appeals System:** Integrated workflow for users to appeal bans or suspensions, with dedicated RLS policies for secure access.
- **Slug Uniqueness:** Hardened slug management to prevent collisions, ensuring each business has a unique public URL.
- **Onboarding Quality:** Database-level enforcement to ensure businesses have required branding and contact info before becoming fully active.
- **Profile Stability:** Fixed regressions in user profile updates that were causing metadata loss during auth state changes.

---

## [20260518210000 - 20260518211000] Terms of Use & Trigger Optimization

### Purpose
Implements Phase 1 of Terms of Use acceptance and updates the `handle_new_user` trigger to persist terms metadata from auth registration.

### Affected Tables
- `public.profiles`: Added `terms_accepted_at`, `terms_version`, and `last_warning_at`.

---

## [20260518100000 - 20260518200000] Moderation Foundation, Public Restrictions & RLS Stabilization

### Purpose
Introduced a comprehensive Moderation System (warnings, suspensions, bans, soft deletes, and business freezing) and resolved critical infinite recursion errors in PostgreSQL Row Level Security (RLS).

### Affected Tables
- `public.profiles`: Added `account_status`, `suspended_until`, `warning_count`, `banned_at`, `banned_reason`, `is_deleted`, and `deleted_at`.
- `public.businesses`: Added `is_frozen` to isolate and hide businesses from the public without deleting data.
- `public.moderation_actions`: Created a new table for auditing all administrative actions.

### Key Stabilization Techniques
- **RLS Recursion Fix:** Replaced naive cross-table references in RLS policies with a `SECURITY DEFINER` function (`is_admin()`). This strictly prevents `500 Internal Server Errors` caused by deep policy evaluation loops.
- **Public Visibility Restrictions:** Updated all public `SELECT` policies for `businesses`, `business_pages`, and `page_links` to enforce `is_frozen = false`, securing the public frontend.
- **Admin Bypass:** Ensured the `is_admin()` function grants unrestricted read/write access to the database, independent of the admin's own `account_status`.

---

## [20260517130000] Full Verification System

### Purpose
Implements the formal verification workflow for businesses, moving from a manual boolean flag to a request-based moderation system.

### Affected Tables
- `public.businesses`: Added `is_verified`, `verification_status`, `verified_at`, `verified_by`, and `verification_requested_at`.
- `public.verification_requests`: (Created in previous steps or stabilized here) Tracks the history of requests.
- `public.profiles`: Updated RLS policies to allow admins to view all profiles (necessary for showing who verified a business).

### Triggers
- `on_business_created_verification`: Automatically verifies businesses created by an administrator.

### Security Impact
- **RLS:** Hardened access to the `verification_status` field.
- **Integrity:** Uses foreign keys to link verifiers (`verified_by`) to the `profiles` table.

### Rollback Considerations
- Dropping the columns in `businesses` will lose all verification history.
- Ensure `is_verified` is not being used as a hard dependency for critical auth logic before rolling back.

---

## Earlier Migrations (Summary)

- **20260516193000 - 20260516194500:** Tenant Isolation & RBAC Hardening.
- **20260516092754:** Storage & Branding (Logo support).
- **20260515160302:** Initial Schema (Profiles & Base Auth).
