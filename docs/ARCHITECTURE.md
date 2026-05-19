# Technical Architecture

## Principles

1. **Separation of Concerns:** Each layer has a specific responsibility.
2. **Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions.
3. **Single Source of Truth:** Data should have one authoritative source.

## Layers

### 1. Domain (`src/core/domain`)
- **Entities:** Pure business objects (e.g., `Business`, `Review`, `ModerationAction`).
- **Interfaces:** Repository and Service definitions (Abstractions).

### 2. Application (`src/core/application`)
- **Use Cases:** Orchestrate the flow of data. Examples: `get-public-rankings.ts`, `submit-verification-request.ts`, `submit-appeal.ts`.
- **DTOs:** Data Transfer Objects for clean boundaries.

### 3. Infrastructure (`src/core/infrastructure`)
- **Repositories:** Concrete implementations (e.g., `SupabaseBusinessRepository`).
- **Mappers:** Transform data between DB schema and Domain entities.

### 4. UI Layer (`src/components`, `src/app`)
- **Server Components:** Default for data fetching and initial rendering.
- **Client Components:** Used for interactivity (forms, modals, real-time feedback).
- **Hooks:** Domain-specific hooks (`useBusiness`, `useReviews`, `useModeration`).

## State Management & Auth Flow

- **Server State:** Handled by Next.js Server Components.
- **Client State:** React `useState`, `useActionState` (React 19), and Context Providers (`RootProvider`, `BusinessProvider`).
- **Middleware:** `src/middleware.ts` intercepts all requests to:
  1. Refresh Supabase session (ensures fresh account status).
  2. Implement Rate Limiting.
  3. Enforce Moderation Blocks (Banned, Suspended, Deleted).
  4. Enforce Terms of Use Re-acceptance.
  5. Enforce Onboarding Quality (redirects to finish setup if incomplete).
  6. **Admin Master Bypass:** Guarantee that `role = 'admin'` users bypass all moderation blocks.

## Core Systems

### Moderation & Appeals Lifecycle
1. **Sanctions:** Warnings (soft), Suspensions (temp block), Bans (perm block), Soft Delete (deactivation).
2. **Transparency Center:** Users view their status and history at `/dashboard/moderation`.
3. **Appeals Flow:** 
   - User submits an appeal via `ModerationAppealModal`.
   - Admin reviews and decides in `/admin/appeals`.
   - Approval triggers automated reversal of the sanction and notifies the user.
4. **Business Freezing:** `is_frozen = true` disables public visibility, slugs, and review links.

### Ranking System (Bayesian Average)
Used in `src/core/application/use-cases/get-public-rankings.ts` to provide fair rankings:
- **Formula:** `(v*R + m*C) / (v+m)`
  - `v`: Number of reviews.
  - `m`: Threshold (minimum reviews).
  - `R`: Average rating.
  - `C`: Platform-wide average.
- **Multipliers:** Verified businesses (`is_verified`) and Featured businesses receive visibility boosts in the final score.

### OG Image Architecture (Dynamic Branding)
- **Tech:** `next/og` running on **Vercel Edge Runtime**.
- **Rendering:** JSX-to-SVG via Satori.
- **Branding:** Dynamically fetches business logo and primary colors to generate a personalized preview.
- **Caching:** `Cache-Control: public, max-age=31536000, immutable`.
- **Constraint:** Must not use Node.js-only libraries.
### Review Abuse Prevention System
- **Hybrid Strategy:** Combines anonymous fingerprinting with server-side cooldowns.
- **Fingerprinting:** SHA-256 hash of stable client attributes (User Agent, timezone, resolution).
- **Throttling:** Enforced via `tr_enforce_review_abuse_protection` trigger.
- **Cooldowns:** 60-minute window per business; 10-minute window for identical content.

### Analytics Anti-Inflation System
- **Deduplication:** Prevents metric manipulation via rapid refreshes or click spam.
- **Trigger-based Throttling:** `tr_enforce_analytics_deduplication` silently drops duplicate events.
- **Cooldown Window:** 15 minutes per business/session/event-type.

### Slug Validation & Protection
...
- **Uniqueness:** Guaranteed by `is_slug_available` database RPC.
- **Normalization:** Forced lowercase and accent removal.
- **Route Protection:** Prevents slugs from matching internal routes (`admin`, `dashboard`, `login`, `register`, etc.).

### Onboarding & Quality Enforcement
- **Multi-step Flow:** Guided process for profile creation, business details, and branding.
- **Quality Gates:** Prevents public activation of businesses with missing critical data (logo, description, valid links).

## Security (RLS & Tenancy)

- **Isolation:** Multi-tenant strictness via `owner_id`.
- **RLS Safety:** Use `is_admin()` security definer to avoid infinite recursion. NEVER query `profiles` directly in RLS.
- **Public Access:** Anonymous access is strictly restricted to `is_frozen = false`.

## Maintainability & Folder Structure

### Important Routes
- `src/app/(auth)`: Authentication and account recovery.
- `src/app/dashboard`: Business owner operations.
- `src/app/admin`: Platform governance and moderation.
- `src/app/[slug]`: Public business pages.
- `src/app/r/[slug]`: Public review flow (Google Review Gate).

### Critical Infrastructure Files
- `src/middleware.ts`: Global security and routing.
- `src/lib/supabase/middleware.ts`: Session and account status synchronization.
- `scripts/db-safety.sh`: Database operations safety guard.
- `scripts/docker-maintenance.sh`: Local environment cleanup.
