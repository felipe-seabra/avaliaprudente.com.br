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

### 4. CI/CD & Branch Protection Strategy
The platform enforces a high-trust development lifecycle through automated guardrails:

- **CI Pipeline (GitHub Actions):** 
  - Every Pull Request and push to `main` triggers a multi-stage validation workflow.
  - **Clean & Stable Checks:** Produces professional, stable check names (Install, Lint, Typecheck, Tests, Build, Security Audit) that map 1:1 to required status checks in GitHub Rulesets.
  - **Security First:** Minimal permissions (`contents: read`) and automated high-severity vulnerability auditing (`npm audit`).
  - **Strict Quality:** Zero-tolerance for Lint errors, Type mismatches, or failing Tests.
  - **Build Verification:** Mandatory production build simulation to ensure Edge compatibility and compilation success.
  - **Performance Optimized:** Uses `npm ci` with dependency caching and concurrency cancellation to maintain a fast feedback loop.
- **Branch Protection & Feature Workflow:**
  - **Immutable Main:** Direct commits to the local `main` branch are strictly forbidden for all AI agents and developers.
  - **Feature Branch Mandate:** All development, including features, bug fixes, and migrations, must occur on dedicated feature branches.
  - **Required Status Checks:** Merging into `main` is blocked unless all clean CI jobs pass.
  - **Linear History:** Forced rebase or squash to maintain a clean and traceable commit log.
  - **Recovery Procedure:** Accidental commits on local `main` must be moved to a feature branch and the local `main` reset to `origin/main` immediately.

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

### Premium NFC Hero Interaction (Final Restoration)
- **Goal:** Demonstrate the core value proposition (NFC -> Review) through a high-end, Apple-like interactive sequence with absolute stability and visual connectivity.
- **Tag-Anchored Composition:**
  - **Visible Anchor:** The physical NFC Tag is a horizontal card, shifted slightly left to allow for an asymmetric, more natural "tap" angle.
  - **Diagonal Vector Entry:** The device enters from the bottom-right on a clear diagonal path, decelerating naturally as it approaches the tag.
  - **Perfect Alignment:** The smartphone lands sensor-first over the tag (overlapping ~1/3 of the card), triggering the NFC interaction and revealing the review UI.
- **Interactive Replay System:**
  - **Auto-Play:** Triggers automatically once when entering the viewport.
  - **Hover & Focus Replay:** A robust state-based key system restarts the entire animation sequence whenever a user hovers or focuses on the component, encouraging engagement.
- **Hierarchy & Spacing:**
  - **Supporting Visual:** Positioned below the primary hero content to maintain messaging dominance while providing a rich visual demonstration.
  - **Compact Integration:** Vertical spacing is tuned to eliminate dead space, creating a cohesive visual unit on both desktop and mobile.
  - **Refined Proportions:** Smartphone and Tag dimensions balanced to ensure the tag remains visible even during the "tap" interaction.
- **Performance & Reliability:** 
  - **Atomic CSS Animations:** Uses isolated keyframes to avoid transform collisions and ensure 60fps performance.
  - **Motion Reduction:** Full support for `prefers-reduced-motion` media query.

### OG Image Architecture (Dynamic Branding)
...
### Review Abuse Prevention System
- **Hybrid Strategy:** Combines authenticated reviewer identity with anonymous fingerprinting and server-side cooldowns.
- **Authenticated Submission:** Public review creation requires Supabase Auth through Google OAuth or Magic Link. The API stores `user_id`, `display_name`, and minimal `auth_provider` attribution for new reviews.
- **Privacy Boundary:** Public review cards render only `display_name`; raw e-mails and provider metadata are never exposed publicly.
- **Fingerprinting:** SHA-256 hash of stable client attributes (User Agent, timezone, resolution).
- **Throttling:** Enforced via `tr_enforce_review_abuse_protection` trigger.
- **Cooldowns:** 60-minute window per business; 10-minute window for identical content.

### Review Abuse Prevention System
...
### Observability & Incident Readiness
- **Structured Logging:** Centralized `Logger` utility using JSON output for seamless ingestion by Vercel Logs, Datadog, or CloudWatch.
- **Security Event Model:** Standardized events for Rate Limiting, CSRF, Auth Anomaly, and Sudo elevation.
- **Privacy-Safe Telemetry:** Fingerprinting using cryptographic peppers to track sessions without persisting raw PII.
- **Request Tracing:** Correlation IDs injected at Middleware to trace requests through the entire stack.
- **Incident Response:** Standardized error normalization (`parseError`) with severity-aware logging.

### Analytics Anti-Inflation System
...
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

## Monetization & Entitlements

The platform implements a **Billing-Agnostic Subscription Foundation** that decouples business logic from specific payment providers (Stripe, Paddle, etc.).

### 1. Architecture Principles
- **Provider-Independent:** Entitlements are resolved internally based on the database state, not directly from third-party webhook events.
- **Centralized Resolution:** All feature checks must use the `canUseFeature(feature)` and `getQuota(quota)` helpers in `src/lib/subscriptions.ts`.
- **Normalized Schema:** 
  - `subscription_plans`: Defines static features and quotas.
  - `user_subscriptions`: Tracks the active state and source of the entitlement.
  - `subscription_audit_logs`: Maintains a tamper-resistant history of all plan changes.

### 2. Entitlement Layer
- **Feature Gating:** Implemented via the `FeatureGate` server component, which wraps premium features with consistent upgrade prompts.
- **Quota Management:** Business logic (e.g., number of businesses, monthly reviews) is enforced via `getQuota` checks and database-level triggers.
- **Global Context:** The `SubscriptionProvider` ensures that the user's plan and rights are reactive and available throughout the frontend.

### 3. Lifecycle & Provisioning
- **Automatic Onboarding:** All new users are automatically provisioned with the "Free" plan via database triggers.
- **Admin Governance:** Super Admins can manually override subscriptions, grant lifetime access, or suspend accounts via the administrative portal.
- **Future Integration:** Designed to allow future payment providers to act only as "Event Sources" that update the internal subscription state.

### Centralized Moderation Scope Architecture
- **Goal:** Eliminate duplicate filtering logic and prevent public moderation leakage.
- **Database Layer:** Views like `public.active_businesses` and `public.active_reviews` provide a canonical "active only" data source.
- **Application Layer:** `PublicScopes` in `src/core/infrastructure/repositories/public-scopes.ts` provides reusable Supabase query builders for public entities.
- **Repository Integration:** Public-facing repository methods MUST use `PublicScopes` or the corresponding database views.
- **Defense-in-Depth:** Moderation is enforced at three levels:
  1. **RLS Policies:** Standard database-level security.
  2. **Database Views:** High-level abstraction for public queries.
  3. **Application Scopes:** Code-level consistency for repositories and use cases.

### Trusted Write Boundaries (RLS Hardening)
- **Goal:** Prevent direct database manipulation and ensure all writes are validated by server-side logic.
- **Restricted Tables:** `reviews` and `analytics_events` have all direct `INSERT` permissions revoked for `anon` and `authenticated` roles.
- **Enforcement:** All writes to these tables MUST go through Next.js API Routes (e.g., `/api/reviews`).
- **Authorization:** API Routes perform validation and then use the `service_role` key to perform the database write, bypassing restricted RLS policies safely.
- **Benefits:** Prevents automated spam, protects PII integrity, and ensures that abuse-prevention triggers (fingerprinting, cooldowns) cannot be bypassed by direct PostgREST calls.

### Distributed Rate Limiting (Abuse Protection)
- **Architecture:** Leveraging Upstash Redis (Serverless SDK) within Next.js Middleware.
- **Why Upstash:** Designed for Edge Runtimes, offering sub-millisecond global latency and HTTP-based connectivity that avoids the overhead of persistent TCP connections in serverless environments.
- **Tiers:**
  - `global`: Default limit for general browsing (100 requests per minute).
  - `api`: Stricter limits for data mutation endpoints (30 requests per 10 seconds).
  - `auth`: High-security limits for Login, Register, and Password Recovery to prevent brute-force attacks (5 attempts per minute).
- **Observability:** Injects standardized `X-RateLimit-*` headers into all responses, allowing clients and administrators to monitor usage and handle throttling gracefully.
- **Resilience:** Includes a secure in-memory fallback for local development, ensuring no external dependencies are required for standard development workflows.

### Privacy Engineering (LGPD Compliance)
- **Goal:** Protect user identity while maintaining effective anti-fraud and analytics capabilities.
- **Non-Reversible Fingerprinting:** All server-side fingerprints are generated using SHA-256 combined with a high-entropy server-side `pepper`. This prevents "rainbow table" attacks where common IPs could be reverse-engineered from their hashes.
- **Ephemeral Identifiers:** Fingerprints are rotated automatically using a daily or weekly seed. This ensures that an anonymous user cannot be tracked as a permanent identifier across long periods, adhering to the "Right to be Forgotten" and data minimization principles.
- **Sanitized Analytics:** User Agents are stripped of unique build versions and specific identifiers before storage. Only general signals (Browser Name, OS) are preserved for legitimate business analytics.
- **Zero Raw PII Policy:** The system is architected to never persist raw IP addresses. Rate limiting and anti-fraud systems operate exclusively on hashed, anonymous identifiers.

### Middleware Security & Trust Boundaries
- **CSRF Protection:** State-changing requests to API Route Handlers (POST, PUT, PATCH, DELETE) undergo strict `Origin` versus `Host` validation to prevent Cross-Site Request Forgery.
- **Security Headers:** A strict Content Security Policy (CSP), along with `X-Frame-Options` and `X-Content-Type-Options`, is injected globally into all Next.js responses, preventing XSS and clickjacking.
- **Session Hardening:** All Supabase SSR cookies enforce `Secure` (in production) and `SameSite=Lax` parameters to prevent session leaks and maintain OAuth integrity.
- **Webhook Isolation:** Payment and external webhook routes (e.g., `/api/webhooks/billing`) are explicitly bypassed from CSRF origin checks but require cryptographic signature validation before trusting any payloads.

### Security Observability & Audit
- **Centralized Audit Trail:** Tamper-resistant audit logs (`audit_logs`) are maintained for all privileged actions, combining database triggers (as the final source of truth) and API-level logging.
- **Security Dashboard (`/admin/security`):** A dedicated, read-only internal dashboard for `super_admin` users providing visibility into:
  - **Security Violations:** Rate-limit breaches, CSRF failures, and webhook signature anomalies.
  - **Privileged Activity:** Sudo elevation, role changes, and account deactivations.
  - **Infrastructure Health:** Real-time visibility into the system's security posture and RLS effectiveness.
- **Metadata Sanitization:** The observability layer automatically redacts sensitive PII (tokens, secrets, raw identifiers) before rendering audit metadata to administrators.
- **Authorization Boundary:** Strictly enforced at the database level (RLS) and server-side (Next.js), ensuring security data never leaks to non-privileged accounts.

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

### Marketing & Hero UX
- **Narrative Animation:** The homepage features a high-fidelity NFC interaction simulation (`src/components/marketing/nfc-hero-animation.tsx`) that establishes the project's value proposition through a "Phone + Tag" narrative.
- **Premium Aesthetics:** 
  - **NFC Tag:** Designed as a vertical premium card with a matte finish, glossy reflections, and "Avalia Prudente" branding.
  - **Visual Realism:** Uses advanced CSS techniques (shadow casting, depth-of-field blur, haptic vibration simulation) to bridge the gap between digital and physical interaction.
  - **Interactive Replay:** Animations are state-synced to trigger on viewport entry and user hover, ensuring accessibility and engagement.

### Legal Compliance & Privacy
- **LGPD Alignment:** Data handling is architected around "Privacy by Design" and "Data Minimization". Endpoints and API responses only expose the minimum required dataset for the requested operation.
- **OAuth Transparency:** Google OAuth integration strictly uses basic profile scopes (`email`, `profile`). Legal documents provide clear guidance on how users can revoke access via their Google account settings.
- **UGC Responsibility:** The platform acts as a routing infrastructure. Public pages and legal documents clearly distinguish between internal feedback (stored) and external redirection (e.g., Google Review Gate), where the platform is not a direct publisher.
- **Anti-Abuse Transparency:** Operational systems explicitly disclose the use of technical fingerprints, rate limiting, and security logging as essential infrastructure protections required for platform integrity.
- **Account Governance:** Secure "Soft Delete" flows ensure users can exercise their right to be forgotten while maintaining necessary audit trails for financial, security, and moderation compliance.

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

## AI & Security Governance

O projeto utiliza um modelo de **Governança AI-First** para garantir que o desenvolvimento assistido por inteligência artificial mantenha a integridade da plataforma.

### 1. Instruções Operacionais (Operational Guides)
- **`docs/ai/shared-context.md`:** Regras universais de segurança, limites de confiança e fluxo de trabalho mandatório.
- **`docs/ai/agents.md`:** Definição de personas (Architect, Implementer, Security-Reviewer) e suas restrições.
- **`docs/ai/GEMINI.md` / `CODEX.md` / `GPT.md`:** Manuais específicos para cada runtime de IA, focando em prevenção de regressões e eficiência de contexto.

### 2. Guardrails de Segurança
- **Trust Boundaries:** Todas as IAs devem validar limites de confiança (Zero-Trust no Cliente).
- **Protected Areas:** Mudanças em `middleware.ts`, migrações SQL e lógica de faturamento exigem revisão de segurança manual.
- **Validation Pipeline:** Nenhuma mudança é considerada completa sem passar por `lint`, `build` e `test`.

### 3. Documentação Referencial
- **`docs/SECURITY_ARCHITECTURE.md`:** Detalhamento técnico das camadas de defesa.
- **`docs/SECURITY_GUARDRAILS.md`:** Checklist rápido de boas práticas e padrões proibidos.
- **`docs/ai/rules/*.md`:** Regras granulares para backend, frontend e banco de dados.
