# Technical Architecture

## Principles

1. **Separation of Concerns:** Each layer has a specific responsibility.
2. **Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions.
3. **Single Source of Truth:** Data should have one authoritative source.

## Layers

### 1. Domain (`src/core/domain`)
- **Entities:** Pure business objects (e.g., `Business`, `Review`).
- **Interfaces:** Repository and Service definitions (Abstractions).

### 2. Application (`src/core/application`)
- **Use Cases:** Orchestrate the flow of data. Examples: `get-public-rankings.ts`, `submit-verification-request.ts`.
- **DTOs:** Data Transfer Objects for clean boundaries.

### 3. Infrastructure (`src/core/infrastructure`)
- **Repositories:** Concrete implementations (e.g., `SupabaseBusinessRepository`).
- **Mappers:** Transform data between DB schema and Domain entities.

### 4. UI Layer (`src/components`, `src/app`)
- **Server Components:** Default for data fetching and initial rendering.
- **Client Components:** Used for interactivity (forms, modals, real-time feedback).
- **Hooks:** Domain-specific hooks (`useBusiness`, `useReviews`).

## State Management & Auth Flow

- **Server State:** Handled by Next.js Server Components.
- **Client State:** React `useState`, `useActionState` (React 19), and Context Providers.
- **Middleware:** `src/middleware.ts` intercepts all requests to:
  1. Refresh Supabase session (ensures fresh account status).
  2. Implement Rate Limiting.
  3. Enforce Moderation Blocks (Banned, Suspended, Deleted).
  4. Enforce Terms of Use Re-acceptance.
  5. **Admin Master Bypass:** Guarantee that `role = 'admin'` users bypass all moderation blocks.

## Core Systems

### Moderation & Appeals
1. **Sanctions:** Warnings (soft), Suspensions (temp block), Bans (perm block), Soft Delete (deactivation).
2. **Transparency Center:** Users view their status at `/dashboard/moderation`.
3. **Appeals Flow:** 
   - User submits an appeal via `ModerationAppealModal`.
   - Admin reviews in `/admin/appeals`.
   - Approval triggers automated reversal of the sanction and notifies the user.
4. **Business Freezing:** `is_frozen = true` disables public visibility, slugs, and review links.

### Ranking System (Bayesian Average)
Used in `src/core/application/use-cases/get-public-rankings.ts` to provide fair rankings:
- **Formula:** `(v*R + m*C) / (v+m)`
  - `v`: Number of reviews.
  - `m`: Threshold (minimum reviews).
  - `R`: Average rating.
  - `C`: Platform-wide average.
- **Weights:** Verified and Featured businesses receive additional multipliers.

### OG Image Architecture
- **Tech:** `next/og` running on **Vercel Edge Runtime**.
- **Rendering:** JSX-to-SVG via Satori.
- **Caching:** `Cache-Control: public, max-age=31536000, immutable`.
- **Constraint:** Must not use Node.js-only libraries (e.g., `fs`, `path`).

### Slug Validation & Protection
- **Uniqueness:** Guaranteed by `is_slug_available` database RPC.
- **Normalization:** Forced lowercase and accent removal.
- **Route Protection:** Prevents slugs from matching internal routes (`admin`, `dashboard`, `login`, `register`, `blocked`, `terms-reaccept`, `forgot-password`, `reset-password`).

## Security (RLS & Tenancy)

- **Isolation:** Multi-tenant strictness via `owner_id`.
- **RLS Safety:** Use `is_admin()` security definer to avoid infinite recursion. NEVER query `profiles` directly in RLS.
- **Public Access:** Anonymous access to `businesses` is restricted to `is_frozen = false`.

## Maintainability & Folder Structure

### Important Routes
- `src/app/(auth)`: Authentication flows.
- `src/app/dashboard`: Business owner panel.
- `src/app/admin`: Platform administration.
- `src/app/[slug]`: Public business pages (The "Product").
- `src/app/r/[slug]`: Public review flow.

### Critical Infrastructure Files
- `src/middleware.ts`: Global security and routing.
- `src/lib/supabase/middleware.ts`: Session and account status synchronization.
- `scripts/db-safety.sh`: Database operations safety guard.
- `scripts/docker-maintenance.sh`: Local environment cleanup.

### Testing Structure
- `src/**/*.test.ts`: Unit and integration tests using Vitest.
- `vitest.setup.ts`: Environment configuration.
- `src/middleware.test.ts`: Critical security testing.
