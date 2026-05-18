# Changelog

All notable changes to this project will be documented in this file.

## [0.2.7] - 2026-05-18

### Fixed
- **Company Verification Flow:** Resolved a 400 Bad Request error by fixing conflicting database constraints on the `verification_status` column.
- **Admin Permissions:** Added missing RLS `UPDATE` policies for the `businesses` and `profiles` tables, allowing administrators to verify companies and moderate users correctly.
- **Trigger Consistency:** Synchronized database triggers (`sync_business_verification`, `handle_business_verification_initial_state`) to use the standardized `'approved'` status instead of the legacy `'verified'`.

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
- Migrations Validation: Ensured all local migrations are compatible with production schema via `npx supabase db push`.
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
