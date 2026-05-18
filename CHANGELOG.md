# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-05-19

### Added
- **Terms & Moderation Transparency (Phase 2):** Enhanced enforcement and user transparency.
  - **Terms Version Enforcement:** Implemented a robust re-acceptance flow when platform terms are updated.
  - **Moderation Transparency Center:** New `/dashboard/moderation` page where users can view their full moderation history, warning counts, and status details.
  - **Improved Blocked UX:** Redesigned `/blocked` page with specific messaging for suspensions, permanent bans, and account deactivations.
  - **Dashboard Integration:** Updated `ModerationStatusBadge` and sidebar to provide direct access to transparency details.
  - **Surgical RLS Updates:** Added policies allowing users to read their own moderation audit logs while preserving admin-only write access.

## [0.3.7] - 2026-05-18

### Added
- **Terms of Use & Moderation Awareness (Phase 1):** Implemented mandatory terms acceptance and increased moderation visibility.
  - **Terms Acceptance Flow:** New checkbox in registration and a mandatory `TermsAcceptanceDialog` in the dashboard for existing users or version updates.
  - **Database Hardening:** Added `terms_accepted_at`, `terms_version`, and `last_warning_at` to profiles.
  - **Trigger Optimization:** Updated `handle_new_user` trigger to automatically capture terms metadata from auth registration.
  - **Moderation Visibility:** New `ModerationStatusBadge` in the dashboard header showing warning counts, suspension status, or ban status to the user.
  - **Updated Content:** Fully revised `Terms of Use` page with clear sections on prohibited behavior, fake reviews, and moderation escalation.

## [0.3.6] - 2026-05-18

### Fixed
- **Total Public Isolation for Frozen Businesses:** Hardened public-facing repositories to prevent direct access to frozen content via slugs or review links.
  - **Repository Hardening:** Updated `BusinessPageRepository` and `ReviewLinkRepository` to explicitly validate `is_frozen` status for all public-facing slug resolutions.
  - **Redirect Protection:** Ensured custom review link slugs (e.g., `/r/custom-slug`) are immediately disabled when the associated business is frozen by moderation.
  - **Type Safety:** Refined TypeScript interfaces in repositories to eliminate `any` usage and improve data integrity during moderation checks.

## [0.3.5] - 2026-05-18

### Fixed
- **Database & Middleware Synchronization (Phase 4):** Resolved a regression where the middleware failed to fetch profiles due to missing `is_deleted` column on the remote database.
  - **Schema Alignment:** Applied missing Phase 3, 4, and 5 migrations to the remote Supabase instance.
  - **Auth Stability:** Restored correct admin role resolution and dashboard access by ensuring all moderation-related fields are available for the middleware session check.
  - **Build Integrity:** Verified full project stability with successful linting and production builds.

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
