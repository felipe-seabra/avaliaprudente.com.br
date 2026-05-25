# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Full Platform Observability & Security Monitoring:**
  - **Structured JSON Logging:** Implemented a new isomorphic `Logger` (`src/lib/logger.ts`) for Edge and Server-side structured logging.
  - **Middleware Security Visibility:** Added real-time logging for Rate Limit (429) and CSRF (403) violations.
  - **Sudo Mode Auditing:** Instrumented Sudo elevation and verification flows with structured security events.
  - **Request Correlation:** Automated injection of `requestId`, `path`, and `fingerprint` into all system logs.
  - **Incident Readiness:** Integrated `error-handler` with the new logger to categorize and track critical failures with appropriate severity.
  - **Webhook Observability:** Hardened the Stripe webhook handler with structured tracking for event lifecycles and signature failures.
  - **Hybrid Audit Trail:** Critical security violations are now mirrored to both JSON logs (operational) and the database `audit_logs` (tamper-resistant governance).

### Added
- **Provider-Aware Sudo Mode:****
  - **OAuth Re-authentication:** Enabled Google OAuth users to complete privileged operations via secure provider-side re-authentication (`prompt=login`).
  - **Provider Detection:** Automated detection of the current user's auth provider to show context-relevant sudo options.
  - **Security Hardening:** Maintained 15-minute elevation window while allowing non-password users to fulfill security requirements without compromising UX.
- **Privileged Operation Security (Sudo Mode):**
  - **Sudo Session Management:** Implemented an encrypted `sudo_session` token using Web Crypto API to elevate privileges temporarily.
  - **Sudo Modal:** Added a reusable `<SudoDialog />` and `useSudo` hook to enforce re-authentication before sensitive operations.
  - **Secured Actions:** Business deletion and account deactivation now require a recent password verification.
- **Audit Logging Foundation:**
  - **`audit_logs` Table:** Added a tamper-resistant database table for tracking sensitive operations.
  - **Database Triggers:** Implemented automatic audit triggers for `business_deleted` and `account_deactivation`.
  - **Service Logger:** Added a server-side `logAuditEvent` utility using the `service_role` key to securely capture events (e.g. profile updates, billing actions).
- **Billing Security Boundaries:**
  - **Service Abstraction:** Created `BillingService` to act as an isolated boundary for future payment gateway integrations.
  - **Secure Webhooks:** Implemented a structured `POST /api/webhooks/billing` handler that enforces cryptographic signature validation.
- **Session Security & CSRF Hardening:**
  - **CSRF Protection:** Implemented robust `Origin` vs `Host` validation in middleware for all state-changing API Route Handlers.
  - **Security Headers:** Added comprehensive headers including a strict Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` to the Next.js middleware.
  - **Webhook Trust Boundaries:** Established isolated routing for external webhooks (e.g., Stripe) with explicit bypasses for CSRF, requiring cryptographic signature validation instead.
  - **Session Hardening:** Explicitly enforced `Secure` and `SameSite=Lax` configurations for all Supabase SSR cookies to protect authentication flows.
- **RLS Hardening & Anonymous Insert Protection:**
  - **Revoked Public Inserts:** Revoked `INSERT` grants on `reviews` and `analytics_events` for `anon` and `authenticated` roles.
  - **Trusted Write Boundaries:** Enforced that all database writes for these tables MUST go through Next.js API Routes using the `service_role` key.
  - **Privacy Hardening:** Revoked `SELECT` access on `analytics_events` for anonymous users to prevent raw data exposure.
  - **Admin & Owner Maintenance:** Preserved `UPDATE` and `DELETE` grants for authenticated users to allow legitimate review management via the API.
  - **RLS Defense-in-Depth:** Dropped overly permissive "Anyone can insert" policies as a secondary security layer.
- **Distributed Rate Limiting (Edge Compatible):**
  - **Upstash Redis Integration:** Replaced the ineffective in-memory middleware rate limiter with a distributed solution using `@upstash/ratelimit`.
  - **Multi-Tier Protection:** Implemented specialized limits for `global` traffic, `api` endpoints, and `auth` (login/register) flows.
  - **Edge Runtime Hardening:** Optimized for Vercel Edge Runtime with HTTP-based Redis connectivity.
  - **Observability:** Added `X-RateLimit-*` and `Retry-After` headers to all responses for transparent abuse prevention.
  - **Development Fallback:** Maintained a local in-memory fallback for development environments to ensure "zero-config" startup for new contributors.
- **Privacy Hardening & LGPD Compliance (Fingerprinting):**
  - **Cryptographic Pepper Strategy:** Implemented a non-reversible hashing mechanism using a secure server-side pepper to prevent IP reverse-engineering.
  - **Ephemeral Rotation:** Introduced daily and weekly rotation for fingerprints, ensuring they do not become permanent identifiers.
  - **User Agent Sanitization:** Implemented a sanitization layer for analytics that extracts only high-level browser/OS signals, minimizing unique data collection.
  - **Zero Raw PII Persistence:** Enforced a strict policy of never persisting raw IP addresses or User Agents in the database or distributed cache.
  - **Privacy-Safe Rate Limiting:** Updated the middleware to use hashed identifiers, protecting user identity even in transient security stores.

### Changed
- **Compliance & Transparency Refactor:** Updated homepage and product copy to accurately reflect platform functionality and adhere to external platform policies.
  - **Accurate Flow Description:** Clarified that positive experiences are redirected to external platforms (like Google) while negative experiences remain internal, ensuring transparency for businesses and consumers.
  - **Policy Alignment:** Removed misleading "collect Google reviews" and "Google review collection" terminology to avoid implying official partnership or manipulation.
  - **Repositioning:** Rebranded the platform as a "Digital Reputation Platform powered by NFC", focusing on sharing experiences and digital interactions.
  - **Updated Marketing Assets:** Refined Hero, Features, FAQ, and Footer sections across the landing page and metadata for improved compliance and technical accuracy.

### Added
- **Final Premium NFC Tag Design:**
  - **Vertical Card Orientation:** Reimagined the NFC tag as a portrait-oriented premium card for a modern business aesthetic.
  - **Enhanced Visibility:** Adjusted the smartphone overlap to reveal 40–45% of the tag, making the "AVALIA PRUDENTE" branding and "TAP TO REVIEW" instruction clearly visible.
  - **Professional Branding:** Added minimal typography, a contactless wave simulation, and a matte dark finish with premium glossy reflections.
  - **Physical Realism:** Implemented a physical shadow cast from the phone onto the tag and added a subtle blur to the tag to simulate depth of field during interaction.
- **Final NFC Hero Refinement (Positioning & Realism):**
  - **Asymmetric Composition:** Shifted the NFC tag slightly left to create a more natural "tap" angle.
  - **Improved Interaction Realism:** Adjusted phone landing coordinates to overlap approximately 1/3 of the tag, simulating actual NFC sensor proximity.
  - **Premium Layering:** Refined tag and phone shadows for better depth separation without overwhelming glow effects.
  - **Animation Stability:** Ensured flawless animation replay on hover/focus across different devices.
- **Interactive NFC Hero Experience (Major Composition Fix):** Rebuilt the hero animation to be fully interactive and visually descriptive.
  - **Visible Anchor Card:** Reintroduced the NFC tag as a horizontal physical card (always visible) to establish the "Phone + Tag" interaction context.
  - **State-Based Replay System:** Implemented a `key`-driven animation restart that triggers on viewport entry, mouse hover, and keyboard focus.
  - **Narrative Interaction:** Refined the smartphone approach to land sensor-first on the tag center, followed by a haptic vibration and NFC pulse effect.
  - **Proportional Balance:** Adjusted smartphone and tag dimensions to ensure the tag remains visible behind the device during the tap.
  - **Zero-Dead-Space Layout:** Tightened vertical spacing to keep the animation integrated with the hero CTA and text.

### Added
- **NFC Hero Animation Final Composition Fix:** Restored the physical NFC tag as the central anchor and refined the interaction flow.
  - **Tag Anchor Restoration:** Reintroduced the physical NFC tag as a centered, straight-oriented anchor with a premium dark material and glossy finish.
  - **Visual Connectivity:** Tuned the composition to ensure the phone approaches and lands sensor-first on the tag, creating a cohesive product demonstration.
  - **Diagonal Vector Refinement:** Refined the entry path (bottom-right -> center) with a natural decelerating slowdown precisely over the tag.
  - **Hierarchy Fix:** Adjusted vertical spacing to eliminate dead space and ensure the animation sits balanced below the hero content.
  - **Responsive Integrity:** Verified that both the tag and phone are fully visible and centered on mobile devices without clipping.
  - **Atomic CSS Animations:** Hardened the isolated keyframe architecture for zero-lag, 60fps performance on all viewports.

### Added
- **NFC Hero Animation Clean Rebuild (Final Pass):** Completely replaced the broken animation architecture with a high-end, Apple-style interactive experience.
  - **Proven Baseline Restoration:** Reverted to the last known stable interaction model as the foundation for refinement.
  - **Static Anchor Point:** Fixed the NFC card as a stable centered focal point (removed all hover/rotation transitions).
  - **Clean Diagonal Motion:** Preserved the diagonal phone approach with refined human-like deceleration.
  - **Proportional Hierarchy:** Slightly reduced dimensions for both the smartphone and card to better support the hero copy and restore visual balance.
  - **Visibility & Reliability Fix:** Resolved all "disappearing phone" bugs by hardening opacity states and `animation-fill-mode: forwards` behavior.
- **Bilingual English Trust Line:** Added a subtle English tagline to the homepage Hero section to improve Google OAuth branding classifier compatibility.
- **Classifier Optimization:** Included the exact phrase "Business reviews and digital reputation platform powered by NFC technology" in the SSR HTML payload.
  - **Premium Aesthetic:** Implemented as a muted, small-typography micro-tagline (text-[10px], 40% opacity) that complements the high-end SaaS design without visual clutter.
- **Cinematic NFC Hero Animation:** Redesigned the primary landing page interaction to feel more premium and conversion-focused.
  - **Magic Moment UX:** New isolated `NfcHeroAnimation` component featuring a smooth, automatic 8-second loop.
  - **High-End Motion:** Implementation of a "phone approach -> pulse -> vibrate -> screen transition" flow using GPU-accelerated CSS keyframes.
  - **Performance Optimized:** Zero extra heavy libraries, using pure CSS and Tailwind for maximum LCP performance and CLS=0.
  - **Accessibility First:** Integrated `prefers-reduced-motion` support and semantic structure.
  - **Luxury Aesthetic:** Refined dark-mode mockups for the smartphone and NFC card with realistic shadows and reflections.

### Changed
- **Premium NFC Interaction Redesign:** Refined the primary hero animation to feel more natural and cinematic (Apple/Stripe style).
  - **Human Deceleration:** Implemented diagonal phone entry with non-linear easing (`cubic-bezier(0.19, 1, 0.22, 1)`) to simulate a hand slowing down as it reaches the NFC tag.
  - **Detection Realism:** Added a critical ~200ms pause after phone arrival before triggering NFC pulses and haptic responses.
  - **Progressive UI Loading:** Redesigned the smartphone screen with a staggered reveal sequence (Header -> Content -> CTA) to simulate a natural mobile experience.
  - **Cinematic Timing:** Orchestrated the entire interaction on a calm, confident 3.5s master timeline with reduced internal motion offsets.
  - **Performance & Accessibility:** Optimized with GPU-friendly `translate3d` transforms, respecting `prefers-reduced-motion` and ensuring zero hydration issues.

### Added
- **Moderation-Aware Cache Invalidation:** Implemented a targeted invalidation strategy to solve stale ISR/client cache issues.
  - **Centralized Invalidation:** New `revalidateBusiness` Server Action for unified cache purging.
  - **Granular Tagging:** Introduced `public-rankings` and `business-page-[slug]` tags using `unstable_cache`.
  - **Automatic Propagation:** Moderation actions (freeze, unfreeze, verify) and business publishing now trigger immediate cache updates.
- **Centralized Moderation Scope Architecture:** Formalized a multi-layer strategy for public visibility to eliminate leakage risks.
  - **Database Views:** Introduced `active_businesses`, `active_reviews`, `active_business_pages`, and `active_page_links` as canonical public data sources.
  - **Application Scopes:** Created `PublicScopes` utility in the infrastructure layer to provide reusable, moderation-safe Supabase query builders.
  - **Defense-in-Depth:** Unified visibility rules across rankings, sitemaps, business pages, and review links.
### Refactored
- **Public Query Logic:** Updated `getPublicRankings`, `BusinessPageRepository`, `ReviewLinkRepository`, and `ReviewSubmissionAPI` to use the centralized moderation scopes.

### Added
- **Review Pagination:** Implemented server-side pagination for business reviews, reviewer account history, and customer dashboard.
  - Added reusable `Pagination` component with mobile-friendly navigation.
  - Updated `get_business_reviews_with_stats` RPC to support `limit` and `offset` for high-performance data fetching.
- **Compliance & Trust Bar:** Added a global `ComplianceBar` for important platform announcements and trust signals.
- **Crawler Visibility Infrastructure:** Introduced `CrawlerComplianceSection` and SSR-specific content wrappers to ensure critical ranking data is visible to search engines even before hydration.

### Improved
- **Governance & Security Hardening:**
  - **SECURITY DEFINER Stabilization:** Audit and refactoring of all database functions to use safe security definers, preventing RLS recursion.
  - **Middleware Auth Resilience:** Hardened authentication checks in middleware to handle session edge cases and provide clearer debug logging.
  - **Reviewer → Customer Onboarding Fix:** Resolved edge cases in the role transition during business onboarding, ensuring metadata and database roles are perfectly synchronized.
  - **Audit Logging Refinement:** Improved the structure and verbosity of moderation and role change logs for better administrative oversight.
- **OAuth & Branding Compliance:**
  - **Canonical Domain Enforcement:** Standardized the entire application to the `https://www.avaliaprudente.com.br` domain, with hardened 301 redirects for non-www traffic.
  - **Google Branding Alignment:** Updated all Google OAuth buttons and assets to strictly follow the latest brand guidelines (spacing, colors, and naming).
  - **SSR Compliance & Visibility:** Guaranteed that legal links (Privacy, Terms, Contact) and a clear platform description are present in the initial SSR HTML payload, ensuring full compliance with Google OAuth verification requirements.
- **Moderation & SEO Synchronization:**
  - **Frozen Business ISR Fix:** Updated Incremental Static Regeneration logic to automatically purge and exclude frozen or banned businesses from public rankings and sitemap.
  - **Sitemap Moderation Sync:** Integrated real-time moderation status into the sitemap generator to prevent indexing of restricted content.
- **UX & Performance:**
  - **Localization Cleanup:** Replaced generic "Discovery" terminology with the more idiomatic "Explorar" in rankings and public discovery sections.
  - **Reduced Reload Behavior:** Optimized client-side navigation to minimize full-page reloads during dashboard transitions and auth state changes.
  - **Console Log Cleanup:** Systematic removal of non-essential production logs to improve performance and privacy.
  - **Dashboard Pagination:** Added pagination to all data-heavy tables in the customer and admin dashboards.
  - **SSR Visibility Improvements:** Optimized initial HTML payload to ensure critical above-the-fold content is readable by crawlers and users with slow connections.

### Added
- **Google OAuth Business Onboarding:** Implemented a new premium onboarding flow for business customers.
  - Added "Continuar com Google" to Login and Register forms.
  - New multi-step `/onboarding` flow for business configuration.
  - Mandatory password setup during onboarding to preserve traditional account security.
  - Integrated role upgrade (reviewer -> customer) into the onboarding process.
  - Reusable `SocialAuth` component for Supabase OAuth integration.
- **Unified Upgrade UX:** Redirected `/account/upgrade` to the new `/onboarding` flow for a consistent experience.
- **Contextual Onboarding:** Added `mode=business` query parameter to registration to trigger business-specific UI and redirects.

### Improved
- **Google Review Redirection UX:** 
 
  - **Retention-First Flow:** Replaced the automatic redirect for positive reviews (4-5 stars) with a lightweight, optional CTA to preserve platform continuity.
  - **New Tab Navigation:** Google Reviews now open in a new tab, preventing users from losing their session on Avalia Prudente.
  - **Premium UI Experience:** Implemented an elegant success state with a clear "Avaliar no Google" button and a subtle "Agora não" option.
  - **Engagement-Centric Design:** Improved reviewer retention by making the transition to external platforms feel like a premium, user-controlled action rather than a forced redirect.

### Added
- **Reviewer Account Settings:**
  - **Identity Management:** Authenticated reviewers can now update their public display name, with changes automatically propagating to all their historical reviews.
  - **Notification Preferences:** Introduced persistence for email notification settings (official responses and platform updates) via the new `notification_preferences` field.
  - **Unified Settings UI:** Created a premium, mobile-first `/account/settings` experience with a clean layout and sectioned navigation.
  - **Privacy & LGPD:** Added a dedicated Privacy section with a simulated data export flow and clear information on data usage.
  - **Safe Account Deactivation:** Implemented a self-service "Soft Delete" flow with a secure confirmation dialog. Deactivated accounts are immediately blocked while preserving audit integrity.
  - **Server-Side Security:** Hardened profile updates with a new `protect_profile_fields` database trigger to prevent unauthorized status or role manipulation.
  - **Auth Metadata Sync:** Ensuring consistency between the `profiles` table and Supabase Auth metadata for seamless UI updates.

### Added
- **Official Review Responses:** Businesses and admins can now respond officially to reviews.
  - **One-Response Limit:** Enforced "one official response per review" to maintain reputation integrity and avoid forum-like threads.
  - **Role-Based Identity:** "Resposta oficial" label for businesses and "Equipe Avalia Prudente" for platform administrators.
  - **Notification Engine:** Integrated with the notification system to alert reviewers via in-app (and future email) when their feedback receives a response.
  - **Management UX:** Added a real-time response editor in the Customer Dashboard with support for creation, editing, and soft-deletion.
  - **SEO & Performance:** Updated the `get_business_reviews_with_stats` RPC to fetch reviews and their responses in a single call, ensuring fast SSR and indexable content.
  - **Security & RLS:** Hardened RLS policies to ensure only business owners or admins can manage responses, with server-side validation.

### Added
- **Reviewer Reputation & Badge System:**
  - **Dynamic Progression:** Introduced a multi-tier reputation system based on approved review counts (Recurrent, Active, Specialist, Elite, Reference).
  - **Admin Reputation Override:** Dedicated "Equipe Avalia Prudente" badge for administrators and super admins to ensure highest-tier trust.
  - **Reputation Stats View:** Implemented a performant database view `reviewer_stats` to track approved reviews while respecting moderation/frozen rules.
  - **Optimized Data Fetching:** Created a specialized RPC function `get_business_reviews_with_stats` to fetch reviews with reviewer stats in a single network call.
  - **Premium UI Components:** Created an elegant, rounded `ReputationBadge` component with subtle gradients, tiny icons, and interactive tooltips.
  - **Dashboard Integration:** Added reputation visualization to the Public Business Page, Reviewer Account page, and Business Owner Dashboard.
  - **Reputation Service:** Centralized badge logic in `src/lib/reputation.ts` for consistent labeling, coloring, and role-aware overrides.

### Added
- **Controlled Role Management:** 
 Implemented a secure role management system allowing authorized administrators to manage user roles (`reviewer`, `customer`, `admin`, `super_admin`).
- **Governance Hierarchy:** Enforced strict role transition rules at both API and database levels (e.g., admins can only manage reviewer/customer roles; super_admins have full authority).
- **Role Audit System:** Created `role_change_logs` table and triggers to automatically audit all role transitions across the platform.
- **Role Management UI:** Added a secure governance dialog in the Admin Users directory for streamlined role updates with built-in validation.
- **Reviewer Role Visibility:** Integrated the `reviewer` role into the administrative interface, including visual badges and specific management options.

### Changed
- **Hardened Governance Trigger:** Updated `enforce_role_management` database trigger to support multi-level administrative authority.
- **Admin Dashboard UI:** Refactored the Customer Directory to use the new server-side Role Management API.

### Fixed
- **Super Admin Restrictions:** Resolved the limitation where only super admins could manage any role, enabling regular admins to manage non-privileged roles safely.

### Added
- **Unified Authenticated Navigation:**
  - Replaced the simple "Meu Painel" button with a comprehensive, role-aware `UserMenu` component for both marketing navbar and dashboard sidebar.
  - Implemented dynamic role-based badges ("Super Admin", "Empresa", "Avaliador") for clear identity visualization.
  - Added a full mobile menu for the landing page using Radix UI `Sheet` to handle both public and authenticated states.
  - Standardized logout flow with automated session invalidation, local storage cleanup (selected business ID), and application-wide state refresh.
  - Contextual navigation links: "Minhas Avaliações" (all users), "Dashboard Empresa" (business owners/admins), "Painel Admin" (super admins), and unified "Configurações".
- **Authenticated Reviewer Flow:**
...

  - Required Supabase-authenticated sessions before review submission.
  - Added Google OAuth as the primary public review login path and Magic Link as a fallback.
  - Added nullable `reviews.user_id`, `reviews.display_name`, and `reviews.auth_provider` fields for backward-compatible lawful attribution.
  - Preloads reviewer display names from provider metadata while requiring a non-empty public name before submission.

### Changed
- **Review Privacy & Anti-Abuse:**
  - Public review cards now render only `display_name` for identity.
  - Review API preserves trusted server-side fingerprinting, browser fingerprint metadata, cooldown triggers, and duplicate-content protection.
  - Review API explicitly blocks unauthenticated, moderated, and frozen-business submissions before using the trusted service-role insert.

### Fixed
- **Auth Flow & Redirect Persistence:**
  - Standardized the entire application to the canonical `https://www.avaliaprudente.com.br` domain to resolve session inconsistencies and `otp_expired` issues.
  - Replaced dynamic `window.location.origin` with `APP_CONFIG.url` (canonical www version) for all auth-related redirects (Google OAuth, Magic Link).
  - Implemented defensive domain normalization in middleware to automatically redirect non-www traffic to the canonical www subdomain in production.
  - Hardened the Magic Link authentication flow to ensure users are correctly returned to the original review page (e.g., `/r/[slug]?review=1`) after login.
  - Improved the auth callback route to robustly handle both `next` and `redirect_to` parameters using native URL APIs.
  - Enhanced `ReviewFlow` with safer absolute URL construction for redirects, preventing context loss across different browsers and providers.
  - Added specialized error handling in the callback to return users to the review page with a clear error marker (`auth_error=1`) instead of a generic error page.

- **Review Auth Redirects:**
  - Preserved the review page `next` context through Google OAuth and Magic Link callbacks.
  - Hardened `/auth/callback` with server-side internal redirect validation to prevent open redirects.
  - Expired or invalid review auth links now return to the original review page with `?review=1&auth_error=1` instead of losing context.

### Operational
- **Aider Integration & Unified AI Workflows:**
  - **Aider as Primary Agent:** Officially integrated Aider as a primary operational agent alongside Codex CLI, specifically for large-context refactoring, architectural overhauls, and deep debugging.
  - **New Context Files:** Created `docs/ai/AIDER.md` to define Aider's operational scope, project constraints, and specific expectations for the Next.js/Supabase architecture.
  - **Unified Workflows:** Created `docs/ai/AI_WORKFLOWS.md` to clarify the specialized roles and collaboration flow between Aider, Codex CLI, and Gemini CLI.
  - **Standardized Discipline:** Updated `docs/ai/shared-context.md` to establish a unified commit, validation, and documentation discipline for all agents.
  - **Onboarding Updates:** Refactored `docs/ai/onboarding/flows.md` and `docs/ai/agents.md` to map Aider to the Architect, Refactor, and Security-Reviewer roles, and provide clear startup instructions.
  - **Deprecated Gemini CLI (Execution):** Further downgraded Gemini CLI to a secondary research and documentation role, updating `docs/ai/GEMINI.md`.
  - **Repository Hygiene & Artifact Isolation:** Hardened `.gitignore` to professionally exclude local AI artifacts (`.aider*`, `.cursor*`, `.claude*`, etc.) while preserving shareable project-level AI context. Updated `shared-context.md` with explicit machine-specific state isolation rules.

- **Codex-First Migration:**
  - **Primary Agent Transition:** Officially migrated the repository's primary operational runtime from Gemini CLI to Codex CLI.
  - **Operational Guide Overhaul:** Upgraded `docs/ai/CODEX.md` to be the primary guide, incorporating all safety, governance, and architectural discipline rules.
  - **Shared Governance Standardization:** Updated `docs/ai/shared-context.md` to establish Codex CLI as the official agent and enforce the mandatory `Implement → Lint → Build → Test → Docs → Commit` lifecycle.
  - **Onboarding Modernization:** Refactored `docs/ai/onboarding/flows.md` to prioritize Codex CLI for new AI contributors and maintain Gemini as a secondary/compatible runtime.
  - **Documentation Synchronization:** Updated `GPT.md`, `agents.md`, and `implemented-features.md` to reflect the new agent architecture and execution priorities.

## [0.19.0] - 2026-05-21

### Added
- **Super Admin Governance Hierarchy:**
  - **Super Admin Role:** Introduced a privileged `super_admin` role with exclusive authority over platform governance and administrative access management.
  - **Database Level Security:** Implemented `is_super_admin()` PostgreSQL function and a robust `tr_enforce_role_management` trigger on the `profiles` table, ensuring that only Super Admins can promote/demote users or manage admin roles.
  - **Admin Hierarchy Support:** Updated `is_admin()` to automatically include Super Admins, maintaining full operational access while adding a new layer of control.
  - **Restricted Access Management:** Secured all role-management endpoints and UI components, hiding escalation tools from regular administrators.
  - **UI/UX Governance:** Added "Super Admin" badges, conditional rendering of governance controls in the Customer Directory, and role-aware Sidebar headers.
  - **Auth & Middleware Hardening:** Updated Next.js middleware and server-side layouts to support the new role hierarchy with authoritative database-level checks.
- **Database Schema Synchronization:**
  - **Role Enum Formalization:** Created the `user_role` PostgreSQL enum type (`customer`, `admin`, `super_admin`) to support the new hierarchy.
  - **Profile Constraints Hardening:** Updated the `profiles` table with a robust check constraint for roles, ensuring strict data integrity.
  - **Type Safety Update:** Regenerated Supabase TypeScript types to include the new enum and governance functions.

### Changed
- **Moderation Master Bypass:** Super Admins now inherit and reinforce the master bypass for all moderation restrictions (suspensions, blocks, frozen businesses).
- **Security Visibility:** Excluded Super Admins from moderation status badges and other user-facing restriction indicators.

### Fixed
- **Frontend Authorization Normalization:**
  - Resolved issue where `super_admin` role was not correctly recognized in the dashboard.
  - Normalized authorization logic across middleware, guards, components, and server-side layouts.
  - Implemented centralized `isAdmin` and `isSuperAdmin` helpers in `src/lib/auth-utils.ts`.
  - Corrected `PlanBadge` logic to treat Super Admins as Business Plan operators.
  - Fixed `AppSidebar` and `PageEditor` to correctly render admin-only controls for Super Admins.

## [0.18.1] - 2026-05-21

### Fixed
- **Dashboard UI:** Fixed a PT-BR typo in the metrics subtitle ("Satiscação média" -> "Satisfação média").

## [0.18.0] - 2026-05-21

### Added
- **Native SEO Infrastructure:**
  - **Dynamic Sitemap:** Implemented `src/app/sitemap.ts` using Next.js 15 metadata routes, automatically indexing homepage, public business pages, and legal pages.
  - **Robots Configuration:** Created `src/app/robots.ts` to manage crawler behavior, allowing public routes and blocking private areas (/admin, /dashboard, /api, /auth).
  - **Showcase Indexing:** Added demo routes (`/r/demo`, `/r/demonstracao`) to the sitemap to improve product discoverability.
  - **Multi-Tenant SEO Safety:** Integrated `BusinessPageRepository.getSitemapEntries` to ensure only non-frozen and published businesses are indexed.

### Changed
- **Repository Architecture:** Extended `BusinessPageRepository` with `getSitemapEntries` to centralize public visibility logic and follow Clean Architecture patterns.

## [0.17.0] - 2026-05-20

### Changed
- **Dashboard Monetization UX Refinement:**
  - **Redundancy Elimination:** Removed the plan card block from the sidebar to reduce visual clutter and prioritize navigation.
  - **Consolidated Plan Visibility:** Maintained the compact `PlanBadge` in the dashboard header as the single source of truth for subscription status.
  - **Contextual Upgrade CTA:** Moved the "Fazer Upgrade" button into the `PlanBadge` component, appearing only for Free plans (disabled) and hidden for Business/Admin accounts.
  - **Premium Layout Density:** Improved dashboard aesthetics by shifting monetization indicators to a subtle, header-integrated placement.

## [0.16.0] - 2026-05-20

### Added
- **Dashboard Subscription Visibility:**
  - **Plan Indicator:** Added `PlanBadge` component to display the current business plan ("Plano Gratuito" / "Free Plan") in the dashboard overview and sidebar.
  - **Upgrade CTA:** Introduced a "Fazer Upgrade" button in the sidebar (disabled with "Coming Soon" tooltip) to prepare for future monetization.
  - **Sidebar Plan Section:** Added a dedicated plan status area in the `AppSidebar`.
  - **Admin Plan Context:** Refined `PlanBadge` to automatically display "Plano Business" for platform administrators, removing the "Free Plan" constraint from their view.

### Fixed
- **Dashboard Stability & Admin Regression:**
  - **Context-Safe PlanBadge:** Refactored `PlanBadge` to use `useContext` safely, preventing crashes in areas without `BusinessProvider` (e.g., Admin Panel).
  - **Admin Layout Resilience:** Hidden the plan section in `AppSidebar` when navigating `/admin` routes to maintain a clean administrative experience.
  - **Role-Aware Sidebar:** Improved sidebar logic to conditionally render monetization features based on the current route context.
- **UX Refinement & Badge Density:**
  - **Visual Noise Reduction:** Removed the `PlanBadge` from `TopNav` to prioritize critical moderation alerts and notifications, maintaining a minimal and premium interface.
  - **Hierarchical Clarity:** Consolidated plan information in the Sidebar and Page Header, where it provides the most value without cluttering transient navigation.

## [0.15.0] - 2026-05-20

### Added
- **Mandatory Operational Governance & Documentation Sync:**
  - **New Repository Rule:** Established that ALL implementation tasks must include mandatory documentation synchronization.
  - **Shared Governance Update:** Updated `docs/ai/shared-context.md` with explicit requirements to evaluate documentation impact for every change (Changelog, Current State, Architecture, Security, etc.).
  - **Hardened Completion Workflows:** Updated `docs/ai/GEMINI.md` and `docs/ai/CODEX.md` with a mandatory completion checklist and lifecycle (Implement -> Lint -> Build -> Test -> Docs -> Commit).
  - **Project State Tracking:** Added "Operational Governance" section to `docs/current-state/implemented-features.md` to track the implementation of these disciplinary rules.

## [0.14.0] - 2026-05-20

### Changed
- **Operational Documentation Rollback (AGY -> Gemini CLI):**
  - **Restored Primary Operational Guide:** Reintroduced `docs/ai/GEMINI.md` as the official entrypoint for Gemini CLI workflows.
  - **Cleaned AGY References:** Removed `docs/ai/AGY.md` and replaced Antigravity-specific assumptions in `docs/ai/GPT.md`, `docs/ai/onboarding/flows.md`, and `docs/ai/shared-context.md`.
  - **Preserved Governance & Architecture:** Maintained all architectural hardening, security workflows, and multi-tenant isolation rules introduced during the AGY phase.
  - **Restored Gemini CLI Context:** Reintroduced `update_topic` and sub-agent usage expectations in operational documentation.

## [0.13.0] - 2026-05-20

### Changed
- **Operational Documentation Migration (Gemini CLI -> AGY):**
  - **Renamed AI Operational Guide:** `docs/ai/GEMINI.md` is now `docs/ai/AGY.md`, reflecting the shift to the Antigravity CLI workflow.
  - **Consolidated Architecture & Security Intelligence:** Updated `docs/ai/GPT.md` and `docs/ai/AGY.md` with the latest system state, including Review Abuse Prevention, Analytics Anti-Inflation, and OG Image stabilization.
  - **Modernized AI Workflows:** Updated `docs/ai/onboarding/flows.md` and `docs/ai/shared-context.md` to align with the AGY agent-driven development cycle.
  - **Hardened Operational Safety:** Refined `docs/OPERATIONAL_SAFETY.md` and `docs/ARCHITECTURE.md` to document trusted server-side ingestion and multi-tenant security guardrails.

## [0.12.0] - 2026-05-19

### Added
- **Enforced Business Onboarding & Quality Rules:**
  - **Mandatory Google Review Link:** New businesses now start as `is_published = false` (Draft Mode) and require a valid Google Review link to be fully activated.
  - **Verification Eligibility Protection:** Formalized requirements for the "Official Verification" request: minimum of 1 social/external link AND a valid Google Review link.
  - **Smart Onboarding Alert:** New dashboard component that guides users through missing steps (Google Link, Social Links) and blocks verification requests until criteria are met.
  - **Google Review Tutorial:** Integrated step-by-step interactive tutorial with visual examples to help users find and configure their correct Google Review URLs.
  - **Unpublished Page State:** Implemented a "Página em Configuração" fallback for public links of businesses that haven't completed onboarding, protecting platform quality.
  - **Robust URL Validation:** Enhanced `isValidGoogleReviewUrl` with support for `maps.app.goo.gl`, `g.page`, and direct search result patterns, including domain-level safety checks.
  - **Auto-Activation Flow:** Creating the first Google Review link now offers/triggers automatic page publication, streamlining the "Go-Live" experience.

### Changed
- **Database Trigger Refactor:** Updated `handle_new_business` trigger to default new business pages to `is_published = false`.
- **Public Page Logic:** Enhanced `BusinessPublicPage` and `getBusinessData` to respect publication status while allowing owners and admins to preview draft pages.
- **Verification UI:** Improved `VerificationRequestModal` with real-time requirement checklists and clear messaging for ineligible businesses.

### Fixed
- **Build Stability:** Resolved type errors in `@base-ui` Accordion components and restored accidentally removed utility functions (`isValidSlug`).
- **Lint Cleanup:** Removed unused imports and variables in onboarding components.

## [0.11.0] - 2026-05-19

### Changed
- **Project Structure Cleanup & Consolidation:**
  - **Redundant Folder Removal:** Safely deleted empty directories: `src/components/layout`, `src/core/domain/repositories`, `src/hooks/use-business`, `src/providers/business-provider`, `src/styles`, and `supabase/snippets`.
  - **Moderation Component Consolidation:** Reorganized `src/components/admin` by moving all moderation-related dialogs and appeal review components into a dedicated `src/components/admin/moderation/` subfolder.
  - **Auth Feature Alignment:** Standardized the `(auth)` route group by moving `LoginForm` and `RegisterForm` (and their tests) into their respective feature folders (`/login` and `/register`), matching the pattern of other authentication features.
  - **Refined Imports:** Updated all affected import paths across the admin and auth modules to ensure architectural integrity and build stability.

## [0.10.0] - 2026-05-19

### Changed
- **Premium Auth UI/UX Refactor:**
  - **Redundant Container Removal:** Eliminated unnecessary nested card wrappers in `AuthLayout` and individual forms, reducing visual clutter and the "double-wrapped" appearance.
  - **Spacious Layout:** Increased the maximum width of authentication containers from 400px to 440px to provide more "breathing room" for inputs and buttons.
  - **Premium Card Styling:** Implemented `rounded-3xl`, `shadow-xl`, and `border-muted/50` across all authentication forms (Login, Register, Forgot Password, Reset Password, Terms Re-accept).
  - **Consistent Hierarchy:** Standardized centered headers with improved typography and spacing for a more professional, SaaS-quality feel.
  - **Improved Interactivity:** Refined hover states, active scaling, and transition animations for buttons and navigation links.
  - **Responsive Optimization:** Ensured consistent padding and centering across mobile and desktop devices.

## [0.9.0] - 2026-05-19

### Added
- **Auth UX Improvements:**
  - **Password Visibility Toggle:** Added "show/hide" functionality to password fields across all authentication forms.
  - **Password Confirmation:** Added a mandatory "Confirm Password" field to the registration form with real-time validation.
  - **Quick Navigation:** Added a "Back to Home" button on Login and Register pages for easier navigation.
- **Accessibility Hardening:** Refactored `InputField` to ensure correct label-to-input association, maintaining WCAG compatibility while supporting complex UI elements.

## [0.8.0] - 2026-05-19

### Added
- **Customizable Unique Slugs:** Users can now personalize their business slugs during creation and editing.
- **Real-time Slug Validation:** Visual feedback on slug availability and validity directly in the forms.
- **Automatic Slug Suggestions:** Suggests available alternatives if the desired slug is already taken.
- **Database-level Slug Protection:** Added check constraints and uniqueness verification to prevent collisions across the entire platform.
- **Reserved Route Protection:** Prevents using slugs that conflict with system routes like `admin`, `dashboard`, `login`, etc.

### Changed
- **Case-Insensitive Slugs:** All slugs are now automatically normalized to lowercase and accent-stripped for better SEO and reliability.
- **Slug Editing:** Enabled slug modification in Business Settings with clear warnings about the impact on printed materials.

## [0.7.0] - 2026-05-19

### Added
- **Supabase Auth Configuration Guide:** Created `docs/SUPABASE_AUTH_CONFIG.md` with detailed instructions for production setup.
- **Personalized Auth Emails:** Prepared high-quality HTML templates for Sign-up Confirmation, Password Reset, and Magic Link with Avalia Prudente branding.

### Fixed
- **Production Auth Redirects:** Corrected the fallback URL in `src/lib/constants.ts` to `https://avaliaprudente.com.br` to prevent `localhost` redirects in production.
- **URL Consistency:** Standardized the production domain across code and documentation, removing the `www` sub-domain to match the Supabase dashboard configuration.

## [0.6.0] - 2026-05-19

### Added
- **Dynamic Open Graph & Social Sharing:**
  - **Dynamic OG Images:** Implemented a high-performance dynamic OG image generator for all business pages using Next.js Edge Runtime.
  - **Real-time Stats:** Automatic inclusion of average ratings and total review counts in social previews.
  - **Premium Branding:** Rich visual presentation featuring business logos, brand colors, and "Verified" trust badges.
  - **Unified Slug Support:** Metadata and OG support for both direct business pages and Review Link redirects.
  - **SEO Hardening:** Comprehensive metadata generation with `og:image`, `twitter:image`, and canonical URL support.

## [0.5.0] - 2026-05-19

### Added
- **Appeals & Resolution Center (Phase 3):** Empowerment and formal recourse for moderated users.
  - **Appeals Infrastructure:** New `moderation_appeals` system allowing users to formally contest warnings, suspensions, and bans.
  - **Automated Resolution Flow:** Implemented database triggers that automatically reverse moderation actions (reactivate accounts, unfreeze businesses) upon appeal approval.
  - **User Recourse Flow:** Integrated appeal submission directly into the Moderation Transparency Center, with real-time status tracking and admin feedback.
  - **Admin Management Panel:** New `/admin/appeals` dashboard for administrators to review, respond to, and resolve pending appeals with integrated resolution tools.
  - **Unified Audit Log:** Appeals are now linked directly to their originating moderation actions for a complete transparency chain.

## [0.4.0] - 2026-05-19

### Added
- **Terms & Moderation Transparency (Phase 2):** Enhanced enforcement and user transparency.
  - **Terms Version Enforcement:** Implemented a robust re-acceptance flow when platform terms are updated.
  - **Moderation Transparency Center:** New `/dashboard/moderation` page where users can view their full moderation history, warning counts, and status details.

## [0.3.4] - 2026-05-18

### Fixed
- **Public Visibility Restrictions:** Resolved security issue where frozen/banned businesses were still publicly visible.
  - **RLS Hardening:** Updated SELECT policies for `business_pages`, `reviews`, and `page_links` to filter by `is_frozen = false` for anonymous users.
  - **Public UX:** Implemented a "Business temporarily unavailable" state for direct links to frozen businesses instead of a generic 404.
  - **Listing Filtering:** Explicitly filtered frozen businesses from public rankings (`Elite da Cidade`, `Em Alta Now`) and the sitemap.
  - **Admin Integrity:** Ensured administrators can still audit and manage frozen businesses via public links and the dashboard.

## [0.3.3] - 2026-05-18

### Added
- **Moderation System Phase 4 (Safe Deactivation & Soft Delete):** Introduced support for safe account deactivation without data loss.
  - **Soft Delete Implementation:** Added `is_deleted` and `deleted_at` fields to profiles to allow account closure while preserving referential integrity and audit trails.
  - **Safe Escalation:** Updated moderation triggers to automatically freeze businesses when an account is deactivated.
  - **Middleware Protection:** Enhanced auth middleware to block access for deactivated accounts with specific redirection to `/blocked?type=deleted`.
  - **Admin UX:** New `ModerationDeactivationDialog` and integrated "Deactivate Account" action in the customer directory.
  - **Anonymization Ready:** Architecture now supports future anonymization of public data for deactivated users.

## [0.3.2] - 2026-05-18

### Added
- **Moderation System Phase 3 (Permanent Bans):** Implemented full support for permanent user bans in the admin dashboard and database.
  - **Database Migration:** Added `banned_at` and `banned_reason` fields to profiles and updated moderation escalation triggers.
  - **Minimalist RLS Integration:** Updated `is_suspended` helper to include banned users, automatically securing all related entities (businesses, reviews, pages).
  - **Admin Actions:** New `ModerationBanDialog` requiring explicit reasons and confirmation for permanent bans.
  - **Middleware Hardening:** Updated auth middleware to detect banned status and redirect users to `/blocked?type=banned` without breaking admin access.
  - **Auditability:** All ban actions are now logged in the `moderation_actions` table for full administrative tracking.

## [0.3.1] - 2026-05-18

### Fixed
- **Environment & Schema Synchronization:** Resolved a critical failure where the middleware was attempting to access non-existent database columns (`suspended_until`) on the remote Supabase instance.
  - **Migration Deployment:** Successfully pushed the remaining Phase 2 Moderation migrations to the remote database, aligning the schema with the latest application code.
  - **Database Integrity:** Verified that all moderation fields (`suspended_until`, `account_status`, `is_blocked`) are now properly synchronized and accessible.

## [0.3.0] - 2026-05-18

### Fixed
- **Admin Access Root Cause Resolution:** Eliminated a hydration race condition that caused authenticated administrators to be redirected to the dashboard during page load.
  - **Multi-Layered Auth Guards:** Implemented a dual-layered protection strategy with both Server-Side (RSC) and Client-Side (AdminGuard) validation.
  - **Zero-Skeleton Unauthorized Access:** Created `AdminGuard` component to prevent rendering of administrative UI and skeletons until the user's role is definitively resolved as `admin`.
  - **Auth Resilience:** Hardened `AdminLayout` with immediate server-side role verification, ensuring 403-like redirection happens before the browser even starts hydration.
  - **Diagnostic Telemetries:** Added persistent debug logs to both server and client layers to trace authentication lifecycle and prevent future regressions.

## [0.2.9] - 2026-05-18
...
## [0.2.8] - 2026-05-18

### Fixed
- **Admin Panel Regression:** Restored full admin panel functionality after Phase 2 moderation changes.
  - **Bypass Protections:** Admins now bypass suspension and frozen business restrictions across the entire platform.
  - **RLS Stability:** Added missing administrative management policies for business pages, links, and QR codes.
  - **Security Hardening:** Implemented database-level and UI-level prevents to ensure admins cannot accidentally suspend or warn their own accounts.
  - **Middleware Logic:** Corrected route protection to ensure administrators maintain uninterrupted access to the dashboard and admin panel regardless of account status.

## [0.2.7] - 2026-05-18

### Added
- **Moderation System (Phase 2):** Implemented account suspensions and business freezing.
  - **Account Suspension:** Admins can now suspend users for specific periods (3 to 90 days), blocking dashboard and admin access.
  - **Business Freezing:** Introduced the ability to freeze businesses, preventing all management and new reviews while maintaining public visibility.
  - **Automated Escalation:** System now suggests escalation to suspension for users with 2+ active warnings.
  - **Real-time Notifications:** Automated alerts for account suspension and reactivation.
  - **Middleware Protection:** Hardened application boundaries to redirect suspended users to a dedicated informational page.
  - **RLS Hardening:** Updated database policies to strictly prevent data mutations from suspended accounts or within frozen businesses.
- **Moderation System (Phase 1):** Implemented the foundation for progressive moderation.
  - **Audit Log:** Created `moderation_actions` table to track all administrative actions.
  - **Warning Infrastructure:** Admins can now send formal warnings to users with mandatory justifications.
  - **Automated Workflows:** Integrated database triggers to automatically increment warning counts, update account status to `'warned'`, and dispatch real-time notifications to target users.
  - **Admin UI:** Added "Send Warning" action to the Customers directory and integrated moderation badges (warning count, status) into the management table.
- **Component System:** Added `warning` variants to `Badge` and `Button` components for consistent moderation UI.

### Fixed
- **Database Stability (RLS Recursion):** Eliminated 500 Internal Server Errors in production caused by infinite recursion in RLS policies. Standardized all admin checks to use a robust `SECURITY DEFINER` function (`is_admin`).
- **Migration Chain Stability:** Resolved a critical failure in `npx supabase db reset` by fixing a column name mismatch in the `20260517150000_core_verification_schema.sql` migration (changed `requested_by` to the standardized `user_id`).
- **Company Verification Flow:** Resolved a 400 Bad Request error by fixing conflicting database constraints on the `verification_status` column.
- **Admin Permissions:** Added missing RLS `UPDATE` policies for the `businesses` and `profiles` tables, allowing administrators to verify companies and moderate users correctly.
- **Trigger Consistency:** Synchronized database triggers (`sync_business_verification`, `handle_business_verification_initial_state`) to use the standardized `'approved'` status instead of the legacy `'verified'`.
- **Infrastructure:** Resolved a `PGRST205` error by ensuring the `notifications` table and its RLS policies exist via a new migration.
- **UX Resilience:** Hardened the `NotificationBell` component with defensive error handling to prevent UI failures or infinite retry loops when database tables are unavailable.

## [0.2.6] - 2026-05-17

### Changed
- **Unified Multi-AI Governance:** Consolidated the entire AI operational architecture into the `docs/ai/` directory.
- **Centralized Documentation:** Created `docs/ai/shared-context.md` as the universal rulebook for all AI agents. Optimized and relocated `GEMINI.md`, `GPT.md`, and added a new `CODEX.md` specifically for IDE execution.
- **AI Workflows:** Moved scattered rules and workflows (`rules/`, `workflows/`, `review/`) into `docs/ai/` to prevent fragmentation.
- **AI Tooling:** Added `docs/ai/onboarding/flows.md` and `docs/ai/prompts/library.md` for consistent and safe session startups across different models.

## [0.2.5] - 2026-05-17

### Added
- **Portable Intelligence Layer (`GPT.md`):** Created a centralized, LLM-optimized context document for fast onboarding in new AI sessions, summarizing architecture, governance, debt, and critical business rules in a single file.

## [0.2.4] - 2026-05-17

### Changed
- **AI Governance Architecture:** Centralized the AI operational instructions into a single source of truth (`GEMINI.md`) at the repository root, optimizing for context loading and preventing fragmented instructions across multiple files.
- **AI Roles System:** Formalized the `docs/ai/agents.md` file to introduce strict persona-based workflows (Architect, Implementer, Debugger, Reviewer, Security-Reviewer, Documentation, Refactor), each with clear boundaries and responsibilities.

### Removed
- **Deprecated Documentation:** Removed `docs/ai/gemini.md` and `docs/ai/GEMINI_COMPLETE.md` to eliminate conflicting rules and redundancy.

## [0.2.3] - 2026-05-17

### Added

- **AI Governance Structure:** Established a dedicated framework for AI-assisted development, including specific rules for Architecture, Backend, Frontend, Database, and Security.
- **Architectural Decision Records (ADRs):** Documented core project decisions (Multi-tenant RLS, Auth SSR, Verification Flow, Clean Architecture).
- **Development Workflows:** Standardized workflows for Features, Debugging, Code Review, and Releases.
- **Security & Safety Hardening:** Created a "Protected Areas" guide and a specialized "Review Checklist" to prevent regressions in critical modules.
- **Improved Project Memory:** Refined documentation for AI agents, making it more concise and technical.

## [0.2.2] - 2026-05-17

### Added

- **Project Memory System:** Initialized a comprehensive documentation system to preserve architectural context and business rules.
- **Generated Documentation:** Added `docs/generated/project-memory.md`, `system-map.md`, and `git-summary.md` for high-level overview.
- **State Documentation:** Created `docs/current-state/implemented-features.md`, `known-bugs.md`, and `technical-debt.md` to track technical health.

## [0.2.1] - 2026-05-17

### Added

- **Core Verification Schema:** Stabilized the database layer by adding missing fields (`is_verified`, `verification_status`, `verified_at`, `verified_by`) to the `businesses` table.
- **Verification Requests Table:** Implemented the `verification_requests` table to track formal trust seal applications.
- **Admin Auto-Verification:** New database trigger that automatically verifies businesses created by administrators.
- **Direct Admin Controls:** Added instant "Verify Now" and "Remove Verification" buttons in the Dashboard Page Editor for admin users.

### Fixed

- **Schema Stabilization:** Resolved issues where frontend components were attempting to access non-existent database fields.
- **Status Consistency:** Standardized `verification_status` across the entire application, using `'approved'` instead of the invalid `'verified'` value to comply with database constraints.

### Security

- **Database Hardening:** Implemented strict RLS policies for the new `verification_requests` table, ensuring users can only see their own requests while admins maintain full control.

## [Unreleased]

### Added

- Initial project structure with Next.js 15 and TypeScript.
- Clean Architecture folder structure (`src/core`, `src/components`, etc).
- Supabase integration with `@supabase/ssr` (client, server, and middleware).
- Auth foundation with callback route.
- Theme support with `next-themes` and `ThemeProvider`.
- shadcn/ui initialization with Tailwind CSS 4.
- Design system foundation and constants.
- Strict TypeScript configuration.
- ESLint and Prettier configuration.
- Technical documentation (`README.md`, `ARCHITECTURE.md`).
- `.env.example` file.
- Local Supabase development environment with Docker.
- Initial database schema with `profiles` table and RLS policies.
- npm scripts for local Supabase management.
- Documentation for local development (`docs/LOCAL_SUPABASE.md`).
- Complete authentication flow (Login, Register, Forgot Password, Reset Password).
- Reusable form system with React Hook Form, Zod, and shadcn/ui.
- Protected routes and auth redirection in Middleware.
- Database schema expansion: `businesses`, `review_links`, `qr_codes`, and `reviews` tables.
- Comprehensive RLS policies and indexes for all tables.
- Generated TypeScript types for the entire database.
- Dashboard test page and logout flow.
- Sonner integration for UI feedback.
- Fixed missing Radix UI dependencies (`@radix-ui/react-label`, `@radix-ui/react-slot`).
- Fixed Next.js 15 metadata viewport warning in RootLayout.
- Validated complete UI component system and build success.
- Premium SaaS visual identity with purple accent and elegant dark mode tokens in `globals.css`.
- Complete Landing Page with Hero, Features, How It Works, Pricing, FAQ, and Footer sections.
- Reusable Dashboard Shell with Sidebar, Top Navigation, Breadcrumbs, User dropdown, and Theme Toggle.
- Extensive use of new shadcn/ui components (`sidebar`, `dropdown-menu`, `avatar`, `sheet`, `accordion`, etc) integrated with `@base-ui`.
- Core SaaS logic implementation with Clean Architecture (Infrastructure, Domain, Application layers).
- Business Onboarding flow with `CreateBusinessDialog` and `BusinessSwitcher`.
- Business Context Provider (`BusinessProvider`) to manage active business state across the dashboard.
- Review Link management (CRUD) for each business.
- Public Review Flow (`/r/[slug]`) with premium 1-5 star rating interaction.
- Conditional redirection logic: Positive ratings (>= 4) redirect to Google; negative ratings (< 4) show a private feedback form.
- Internal feedback capture system to preserve business reputation.
- Dashboard summary with total reviews, average rating, and redirection stats.
- Robust data fetching hooks (`useBusiness`, `useReviewLink`).
- Full TypeScript validation and lint cleanup across the entire Phase 4 implementation.
- NFC-First Product Evolution: Transitioned from simple review site to NFC-powered business platform.
- Modular Business Pages: Created `business_pages` and `page_links` tables for customizable landing pages.
- Public Page Root Route: Implemented `/[slug]` to serve business pages with modular CTAs.
- Page Editor: Built a comprehensive dashboard interface for customizing business description and CTA links.
- Modular CTA System: Support for Google Reviews, WhatsApp, Instagram, Facebook, Website, and Portfolio buttons.
- Role-Based Access Control (RBAC): Implemented 'admin' and 'customer' roles in `profiles` and Middleware.
- Admin Foundation: Created `/admin` route with layout shell and role-aware navigation.
- Automatic Page Initialization: New businesses now automatically generate a public page shell.
- Reusable `ReviewFlow` component integrated into the modular page experience.
- Drag-and-Drop CTA Ordering: Implemented mobile-friendly reordering for page links using `dnd-kit`.
- Production QR System: Branded QR code generation with color customization and PNG download.
- Lightweight Analytics: Foundation for tracking page visits and CTA clicks with dedicated `analytics_events` table.
- Analytics Summary: Integrated real-time visit and click stats into the dashboard dashboard.
- Enhanced UX: Improved visual hierarchy, premium hover/touch interactions, and refined mobile layouts.
- Production Polish & SEO: Hardened the application for real-world usage and search engine visibility.
- Global Error Boundaries: Added `error.tsx` and `not-found.tsx` for graceful failure handling.
- Advanced Metadata: Configured robust OpenGraph, Twitter Cards, and dynamic SEO fields in `layout.tsx`.
- Sitemaps & Robots: Auto-generated `sitemap.ts` and `robots.ts` for crawlers.
- Landing Page Refinements: Restructured Hero section with physical NFC mockups and high-conversion copy.
- Pricing Updates: Reflected the new NFC-first physical product offering in the pricing tiers.
- Mobile Optimizations: Ensured all CTAs and interactive elements have appropriate tap targets and animations.
- Stabilization & Debugging: Systematic cleanup of silent failures and improvement of error handling UX.
- Error Normalization Utility: Created `parseError` to translate technical errors (Supabase, Auth) into actionable Portuguese messages.
- RLS Policy Fixes: Resolved recursion issues in the `profiles` table and ensured explicit `insert` permissions for business pages.
- Robust Middleware Roles: Updated middleware to perform direct database role checks for admin protection.
- Enhanced Logout Flow: Added `router.refresh()` to handle session clearing more reliably.
- Global Error UX: Updated all critical forms (Login, Register, Create Business) to surface specific errors via Sonner toasts.
- Improved Loading/Error UI: Refined `/[slug]` page with better loading states and actionable error fallback.
- Production & Infrastructure: Prepared the platform for real-world deployment on Vercel and Supabase Cloud.
- Environment Validation: Implemented `src/lib/env.ts` to validate required secrets on startup.
- Security Headers: Configured CSP, HSTS, XSS protection, and frame options in `next.config.ts`.
- Rate Limiting Foundation: Added basic IP-based rate limiting to the middleware.
- Image Optimization: Configured remote patterns and optimized loading for production assets.
- Deployment Documentation: Created `docs/DEPLOYMENT.md` with checklists, backup, and rollback strategies.
- Supabase Cloud Migration: Transitioned database, authentication, and storage from local Docker to Supabase Cloud infrastructure.
- Migrations Validation: Ensure all local migrations are compatible with production schema via `npx supabase db push`.
- Environment Hardening: Validated environment variable separation and publishable key support.
- Legal & Compliance: Added LGPD-compliant Privacy Policy (`/privacy`) and Terms of Use (`/terms`).
- Business Branding: Implemented logo uploads via Supabase Storage with secure RLS policies and `ImageUpload` UI.
- Critical Routing & SSR Fixes: Resolved public page direct access failures and missing 404s.
- RLS Permissions Update: Added public read access to `businesses` to allow anonymous slug resolution. Fixed `page_links` insert/update policies.
- Missing Routes: Implemented the `/dashboard/settings` page for basic business management (name and slug updates).
- Dashboard UX Enhancement: Added a highly visible "Public Link" card to the dashboard with one-click copy, QR shortcut, and new-tab preview.

## [0.2.0] - 2026-05-17

### Added

- **Full Verification System:** Dedicated workflow for businesses to request the "Official Seal" of trust.
- **Verification Requests Table:** New database table to track request history, admin messages, and timestamps.
- **Admin Verification Dashboard:** Centralized panel for administrators to approve or reject verification requests.
- **Unified Verification UI:** "Blue Badge" (ShieldCheck) consistently displayed across Rankings, Public Pages, and Dashboard.
- **Verification Request Modal:** Reusable component for business owners to submit requests with optional justification.
- **Smart Ranking Algorithm:** Bayesian Average implementation for "Elite da Cidade" ranking, prioritizing verified and high-volume businesses.
- **Trending Score:** Logic to rank "Em Alta Agora" based on recent NFC scans and page visits (last 30 days).
- **Admin Sidebar:** Added direct access to the Verifications panel.

### Changed

- **Business Page Editor:** Integrated the new verification flow, replacing manual status updates with a formal request system.
- **Business Directory (Admin):** Enhanced with status-based filtering (Pending, Approved, Rejected) and verifier tracking.
- **Public Page Trust Indicators:** Added verified badge and total review count to the header for social proof.

### Fixed

- **Stabilization:** Removed temporary test files causing lint errors.
- **Build Integrity:** Resolved type mismatches in Admin and Dashboard repositories.
- **RLS Hardening:** Updated `profiles` policies to allow admins to view all profiles (necessary for verifier attribution).

### Security

- **Verification Logic:** Restricted the ability to self-verify; verification status changes now require admin privileges or specific database triggers.
- **RBAC Enforcement:** Hardened Middleware and RLS to ensure only admins can access moderation tools.
