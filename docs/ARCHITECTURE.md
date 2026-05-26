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

## Monetization & Entitlements

The platform employs a decoupled, provider-agnostic entitlement architecture designed for high stability and commercial flexibility.

### Core Philosophy
- **Internal Authorization Authority:** Subscriptions and entitlements are the **primary source of truth** for platform authorization. The database state, not an external API, determines user capabilities.
- **Provider-Agnostic Core:** The platform logic is completely isolated from specific billing providers (Stripe, Paddle). External providers are treated solely as **event sources** that trigger internal state transitions.
- **Commercial Alignment:** Features and quotas are grouped into logical plans, but authorization checks always target specific features or quota keys, never plan names.

### Entitlement Architecture
1. **Centralized Plan Definitions:** All plan properties (slugs, prices, feature lists, and quotas) are defined in `src/lib/subscription-config.ts`. This is the single source of truth for commercial logic.
2. **Entitlement Resolver:** Access is resolved via centralized helpers:
   - **Server-Side:** `canUseFeature(feature)` and `getQuota(quota)` in `src/lib/subscriptions.ts`.
   - **Client-Side:** `useSubscription()` hook provided by `SubscriptionProvider`.
3. **Super Admin Bypass:** The entitlement resolver layer contains a hardcoded bypass for the `super_admin` role. These users have unlimited access and bypass all commercial restrictions without needing a fake "enterprise" plan.
4. **Quota Enforcement:** Hard limits are enforced at the Application layer. The system validates current usage against plan quotas before allowing mutations (e.g., creating a new business page).

### Feature Gating Strategy
- **SSR Enforcement:** Server components use the entitlement resolver to prevent rendering premium sections to unauthorized users.
- **Middleware Integration:** Critical premium routes can be protected at the edge (planned).
- **Graceful Degradation:** UI components (e.g., `FeatureGate`) provide consistent "Upgrade" prompts when a feature is locked.

### Administrative Management
Platform operators (Super Admins) manage commercial state via the Admin Dashboard:
- **Manual Overrides:** Capability to manually assign plans or extend trial periods.
- **Status Control:** Ability to suspend or expire subscriptions regardless of billing state.
- **Audit Logging:** Every change to a user's subscription or entitlement status is recorded in `subscription_audit_logs` with a reference to the acting admin.

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

### Observability & Incident Readiness
- **Structured Logging:** Centralized `Logger` utility using JSON output for seamless ingestion by Vercel Logs, Datadog, or CloudWatch.
- **Security Event Model:** Standardized events for Rate Limiting, CSRF, Auth Anomaly, and Sudo elevation.
- **Privacy-Safe Telemetry:** Fingerprinting using cryptographic peppers to track sessions without persisting raw PII.
- **Request Tracing:** Correlation IDs injected at Middleware to trace requests through the entire stack.
- **Incident Response:** Standardized error normalization (`parseError`) with severity-aware logging.

### AI & Security Governance

O projeto utiliza um modelo de **Governança AI-First** para garantir que o desenvolvimento assistido por inteligência artificial mantenha a integridade da plataforma.

### 1. Instruções Operacionais (Operational Guides)
- **`docs/ai/shared-context.md`:** Regras universais de segurança, limites de confiança e fluxo de trabalho mandatório.
- **`docs/ai/agents.md`:** Definição de personas (Architect, Implementer, Security-Reviewer) e suas restrições.
- **`docs/ai/GEMINI.md` / `CODEX.md` / `GPT.md`:** Manuais específicos para cada runtime de IA, focando em prevenção de regressões e eficiência de contexto.

### 2. Guardrails de Segurança
- **Trust Boundaries:** Todas as IAs devem validar limites de confiança (Zero-Trust no Cliente).
- **Protected Areas:** Mudanças em `middleware.ts`, migrações SQL e lógica de faturamento exigem revisão de segurança manual.
- **Validation Pipeline:** Nenhuma mudança é considerada completa sem passar por `lint`, `build` e `test`.
