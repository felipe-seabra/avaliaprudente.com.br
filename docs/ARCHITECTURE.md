# Technical Architecture

## Principles

1. **Separation of Concerns:** Each layer has a specific responsibility.
2. **Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions.
3. **Single Source of Truth:** Data should have one authoritative source.

## Hybrid Rendering Strategy

The platform employs a hybrid architecture to balance SEO, performance, and interactive user experience:

1. **Public SSR (Server-Side Rendering):** 
   - **Routes:** Homepage, Business Pages (`/[slug]`), Review Flow (`/r/[slug]`), Rankings, and Legal pages.
   - **Why:** Maximum SEO visibility, instant "Time to Content", and reliable crawler indexing. Critical ranking data and business identities must be available in the initial HTML payload.
   - **ISR (Incremental Static Regeneration):** Used for rankings, sitemaps, and business pages with targeted programmatic revalidation. Leverages `unstable_cache` with stable tags to ensure moderation changes propagate immediately.

2. **Authenticated Query-based UX:**
   - **Routes:** `/dashboard/*`, `/admin/*`, `/account/*`.
   - **Why:** These areas prioritize high interactivity, real-time feedback, and complex state management. Leveraging **React Query** (TanStack Query) allows for:
     - Optimistic UI updates (e.g., responding to a review).
     - Seamless pagination and filtering without full-page reloads.
     - Background data synchronization and intelligent caching.
     - Reduced server load by offloading state management to the client after the initial secure shell is loaded.

### 3. Discovery Infrastructure (SEO & Compliance)
- **Canonical Domain Enforcement:** The platform exclusively uses `https://www.avaliaprudente.com.br`. All non-www traffic is permanently redirected (301) via `src/middleware.ts`.
- **MetadataBase:** Standardized in `src/app/layout.tsx` using `APP_CONFIG.url` to ensure all relative metadata URLs are absolute and correct.
- **SSR Visibility Guarantees:** 
  - Legal links (Privacy, Terms, Contact) are rendered as native `<a>` tags in server components (`ComplianceBar`, `Footer`) to ensure they are present in the initial HTML for crawler and OAuth verification.
  - A dedicated `CrawlerComplianceSection` provides an explicit platform description above the fold in the initial SSR payload.
- **Sitemap & Robots:** Dynamically generated using `APP_CONFIG.url` to maintain 100% consistency with the canonical domain.

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
- **Server Components:** Default for data fetching in public routes and initial layout shells.
- **Client Components:** Used for interactivity (forms, modals, real-time feedback) and all authenticated dashboard features.
- **Hooks:** Domain-specific hooks (`useBusiness`, `useReviews`, `useModeration`).

## State Management & Auth Flow

- **Server State:** Handled by Next.js Server Components and React Query for authenticated views.
- **Client State:** React `useState`, `useActionState` (React 19), and Context Providers (`RootProvider`, `BusinessProvider`).
- **Middleware:** `src/middleware.ts` intercepts all requests to:
  1. Refresh Supabase session (ensures fresh account status).
  2. Implement Rate Limiting.
  3. Enforce Moderation Blocks (Banned, Suspended, Deleted).
  4. Enforce Terms of Use Re-acceptance.
  5. Enforce Onboarding Quality (redirects to finish setup if incomplete).
  6. **Admin Master Bypass:** Guarantee that `role = 'admin'` or `'super_admin'` users bypass all moderation blocks.

## Core Systems

### Business Onboarding Lifecycle
1. **Trigger:** User registers with `mode=business` or clicks "Create Business".
2. **Identity Prefill:** Google OAuth metadata is used to pre-populate name and email.
3. **Password Mandate:** Business owners must set a secure password for account recovery and multi-device access.
4. **Configuration:** Mandatory Google Review link and basic branding (logo/colors).
5. **Activation:** Page defaults to `is_published = false` (Draft) until minimum quality criteria are met.
6. **Role Upgrade:** Upon completion, user is upgraded from `reviewer` to `customer`.

### Moderation & Appeals Lifecycle
1. **Sanctions:** Warnings (soft), Suspensions (temp block), Bans (perm block), Soft Delete (deactivation).
2. **Transparency Center:** Users view their status and history at `/dashboard/moderation`.
3. **Appeals Flow:** 
   - User submits an appeal via `ModerationAppealModal`.
   - Admin reviews and decides in `/admin/appeals`.
   - Approval triggers automated reversal of the sanction and notifies the user.
4. **Business Freezing:** `is_frozen = true` disables public visibility, slugs, and review links. Integrated with ISR to purge stale public content.

### Review Response Architecture
- **Official Identity:** Verified businesses can respond once per review.
- **Admin Oversight:** Platform admins can moderate responses or provide "Avalia Prudente Official" feedback.
- **Data Fetching:** RPC-driven to include responses in the initial review payload, ensuring SEO indexing of business engagement.

### Ranking System (Bayesian Average)
Used in `src/core/application/use-cases/get-public-rankings.ts` to provide fair rankings:
- **Formula:** `(v*R + m*C) / (v+m)`
  - `v`: Number of reviews.
  - `m`: Threshold (minimum reviews).
  - `R`: Average rating.
  - `C`: Platform-wide average.
- **Multipliers:** Verified businesses (`is_verified`) and Featured businesses receive visibility boosts in the final score.

### Reviewer Reputation & Badge System
...

### Cinematic NFC Hero Animation
- **Goal:** Create a high-end, cinematic interactive moment that demonstrates the platform's core NFC value proposition with realistic human-like motion and progressive loading.
- **Architecture:** Isolated into a standalone `NfcHeroAnimation` component using pure CSS, Tailwind CSS, and `IntersectionObserver`.
- **Motion Strategy:** 
  - **Human Deceleration:** Uses a sharp out-easing (`cubic-bezier(0.19, 1, 0.22, 1)`) and diagonal entry to simulate a hand slowing down precisely near the NFC tag.
  - **Premium Interaction:** Features a critical ~200ms detection pause before triggering subtle NFC ripples, a visual haptic vibration (1px shift), and a soft screen light response.
  - **Progressive UI Reveal:** Smartphone screen loads in a staggered sequence (`header-reveal`, `content-reveal`, `cta-reveal`) to simulate a natural mobile OS experience.
- **Trigger Logic:** 
  - **Viewport Activation:** Plays automatically when entering the viewport (threshold 0.3) using `IntersectionObserver`.
  - **Interaction Replay:** Replays the entire 3.5s sequence on hover or focus.
  - **Confidence over Reactivity:** Slower, more deliberate timing to match a luxury product aesthetic.
- **Performance & Accessibility:** 
  - **GPU Acceleration:** Exclusively uses `translate3d`, `rotate3d`, and `opacity` for smooth 60fps performance.
  - **Motion Reduction:** Respects `prefers-reduced-motion` by bypassing all entry and movement animations.

### OG Image Architecture (Dynamic Branding)
...
### Review Abuse Prevention System
- **Hybrid Strategy:** Combines authenticated reviewer identity with anonymous fingerprinting and server-side cooldowns.
- **Authenticated Submission:** Public review creation requires Supabase Auth through Google OAuth or Magic Link. The API stores `user_id`, `display_name`, and minimal `auth_provider` attribution for new reviews.
- **Privacy Boundary:** Public review cards render only `display_name`; raw e-mails and provider metadata are never exposed publicly.
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

### Business Onboarding & Social Auth
- **Hybrid Auth Strategy:** Supports both Google OAuth for friction-less onboarding and traditional Email/Password for long-term account ownership and recovery.
- **Onboarding Convergence:** Unified flow (`/onboarding`) for new business customers, whether they sign up via Social Auth or standard registration.
- **Password Mandate:** Even when using Google for onboarding, business customers are required to set a traditional password. This ensures the account is "billing-ready" and supports multi-channel login.
- **Role Progression:** Users initially receive the `reviewer` role. Completing the business onboarding triggers a transition to the `customer` role via the `/api/auth/upgrade` endpoint.
- **Contextual Redirects:** Utilizes the `mode=business` parameter during registration to guide users into the premium onboarding experience instead of the lightweight reviewer dashboard.
- **Context-Aware Navbar:** The main `Navbar` (`src/components/marketing/navbar.tsx`) dynamically adapts based on the Supabase auth state.
- **Unified UserMenu:** A shared `UserMenu` component (`src/components/shared/user-menu.tsx`) centralizes identity management, role badges, and navigation links for both the marketing site and the internal dashboard.
- **Mobile-First Responsive Design:** Marketing navigation uses a Radix UI `Sheet` for small screens, while authenticated actions remain accessible via the persistent `UserMenu`.
- **Reactive Auth State:** Leverages Supabase's `onAuthStateChange` to ensure real-time UI updates during login, logout, or session expiry, avoiding stale rendering or hydration mismatches.
- **Role-Based Navigation:**
  - **Reviewers:** Focused on `/account` (My Reviews).
  - **Business Owners:** Guided to `/dashboard`.
  - **Super Admins:** Granted access to the specialized `/admin` governance portal.

### Account Management & Privacy (LGPD)
- **Reviewer Settings:** Authenticated reviewers manage identity and preferences at `/account/settings`.
- **Identity Sync:** Updating `profiles.full_name` automatically synchronizes the `display_name` across all historical reviews via the `tr_sync_profile_to_reviews` trigger, ensuring consistency.
- **Notification Preferences:** Users can toggle email notifications for official business responses and platform updates.
- **Safe Deactivation (Soft Delete):** 
  - Users can self-deactivate their accounts, setting `is_deleted = true`.
  - The `protect_profile_fields` trigger prevents unauthorized reactivation or status manipulation.
  - Deactivated accounts are immediately blocked via `middleware.ts`.
  - Referential integrity is preserved for historical reviews and moderation logs.
- **LGPD Compliance:** Support for data portability (Export) and the right to be forgotten (Soft Delete with retention policy).

### Premium Google Review Flow
- **Goal:** Improve retention and platform continuity by transforming forced redirects into optional, user-controlled actions.
- **Intelligent Flow:** After a positive review (4-5 stars), the system displays a success state with a clear CTA to "Avaliar no Google" instead of an automatic redirect.
- **New Tab Strategy:** External navigation to Google Reviews is always performed in a new tab (`_blank`) to ensure the user remains active on the Avalia Prudente platform.
- **UX Logic:** Subtle, non-invasive modals/cards are used to maintain a premium feel and prevent abandonment.

### Centralized Moderation Scope Architecture
- **Goal:** Eliminate duplicate filtering logic and prevent public moderation leakage.
- **Database Layer:** Views like `public.active_businesses` and `public.active_reviews` provide a canonical "active only" data source.
- **Application Layer:** `PublicScopes` in `src/core/infrastructure/repositories/public-scopes.ts` provides reusable Supabase query builders for public entities.
- **Repository Integration:** Public-facing repository methods MUST use `PublicScopes` or the corresponding database views.
- **Defense-in-Depth:** Moderation is enforced at three levels:
  1. **RLS Policies:** Standard database-level security.
  2. **Database Views:** High-level abstraction for public queries.
  3. **Application Scopes:** Code-level consistency for repositories and use cases.

### Cache Invalidation & Consistency Strategy
- **Goal:** Ensure immediate propagation of moderation actions while preserving the performance benefits of ISR.
- **Stable Tags:** Programmatic invalidation via `revalidateTag` using stable patterns:
  - `public-rankings`: Global rankings and homepage highlights.
  - `business-page-[slug]`: Individual business page data and metadata.
- **Centralized Invalidation:** A unified `revalidateBusiness(slug)` server action handles all necessary path and tag purges.
- **Triggers:** Revalidation is triggered by the following events:
  - **Freezing/Unfreezing:** Immediate removal or restoration of public visibility.
  - **Verification Status Changes:** Updating trust signals in rankings.
  - **Onboarding/Publishing:** Making a new business page visible for the first time.
- **Consistency Guarantees:** Moderation actions result in the purge of:
  1. **Full Page Cache:** `revalidatePath('/r/[slug]')`
  2. **Data Cache:** `revalidateTag('business-page-[slug]')`
  3. **Discovery Cache:** `revalidateTag('public-rankings')`
  4. **SEO Infrastructure:** `revalidatePath('/sitemap.xml')`

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
