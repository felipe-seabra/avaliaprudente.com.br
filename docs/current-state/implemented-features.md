# Implemented Features

## UI/UX & Navigation
- [x] **Google OAuth Business Onboarding:** Integrated multi-step onboarding flow for new business customers.
- [x] **Contextual Onboarding (mode=business):** Automated redirection and tailored UI for users starting from a business CTA.
- [x] **Unified Authenticated Navigation:** Comprehensive, role-aware `UserMenu` component for all authenticated states.
- [x] **Responsive Mobile Navbar:** Full mobile-first navigation with interactive `Sheet` menu for marketing and public pages.
- [x] **Dynamic Role visualization:** Clear visual badges for Super Admin, Business, and Reviewer roles in the user menu.
- [x] **Standardized Logout Flow:** Unified session termination across landing page, dashboard, and account pages.
- [x] **Compliance & Trust Bar:** Global notification system for platform announcements.
- [x] **Landing Page foundation:** Premium Hero, Features, Pricing, and FAQ sections.
- [x] **Dashboard Shell:** Sidebar-based administration with breadcrumbs and top-nav alerts.
- [x] **Dark/Light Mode:** Full theme support with system preference detection.

## Auth & Security
- [x] Multi-tenant RLS (owner_id).
- [x] RBAC (admin/customer).
- [x] **Super Admin Governance:** Privileged role hierarchy (`user_role` enum) for authoritative administrative access management.
- [x] **Secure Role Management API:** Server-side role transition logic with explicit hierarchy validation and audit logging.
- [x] **Role Transition Auditing:** Detailed logging of all role changes in `role_change_logs`.
- [x] **OAuth Branding Compliance:** Google-aligned authentication assets and flows.
- [x] Middleware session hardening & central routing.
- [x] Blocked user detection (suspended, banned, deleted).
- [x] Infinite recursion RLS protections (`is_admin` security definer).
- [x] Corrected production redirect URLs (localhost removal).
- [x] Standardized production domain consistency.
- [x] Personalized HTML Email templates (Signup, Reset, Magic Link).
- [x] Centralized Supabase Auth configuration guide.
- [x] Context-preserving auth callback redirects with internal-only validation.

## Moderation System
- [x] Audit Logs (`moderation_actions`).
- [x] Warnings workflow with automated escalation.
- [x] Temporary Suspensions.
- [x] Permanent Account Bans.
- [x] Account Deactivation (Soft Delete).
- [x] Business Freezing (Hiding from public without deletion).
- [x] Complete Admin Bypass mechanism.
- [x] **Transparency Center:** Dashboard for users to view sanctions.
- [x] **Appeals Workflow:** System for contesting moderation actions.

## Core SaaS
- [x] Public Business Page (NFC-ready).
- [x] **Official Business Responses:** Verified response threads for business owners.
- [x] **Review Pagination:** Server-side pagination for high-volume feedback management.
- [x] Drag-and-drop link management.
- [x] Branded QR Code generator.
- [x] Bayesian Ranking system.
- [x] Verification request flow.
- [x] Enforced Onboarding (Mandatory Google Review Link).
- [x] Verification Eligibility Rules (Checklist of requirements).
- [x] Interactive Google Review Tutorial.
- [x] Draft/Unpublished states for business pages.
- [x] **Slug Uniqueness & Reservation:** Protection against collisions and reserved routes.
- [x] **Quality Enforcement:** Database-level checks for business profile completeness.

## Public Flow
- [x] 1-5 Star Rating system.
- [x] Authenticated review submission with Google OAuth and Magic Link fallback.
- [x] LGPD-safe public review attribution via `display_name` only.
- [x] **Reviewer Reputation & Badges:** Multi-tier dynamic reputation system (Recurrent, Active, Specialist, Elite, Reference) based on verified review counts.
- [x] **Admin Reputation Badge:** Automatic "Equipe Avalia Prudente" trusted badge for platform administrators.
- [x] **Premium Google Review Flow:** Non-invasive, optional CTA in a new tab for positive reviews to maximize retention (Improved from automatic redirect).
- [x] Private feedback capture.
- [x] Logo & branding uploads.

## Operational Governance
- [x] **Mandatory Documentation Sync:** Unified rule for all AI agents to keep documentation and changelog updated.
- [x] **Completion Workflows:** Explicitly defined lifecycle (Implement -> Lint -> Build -> Test -> Docs -> Commit) in `CODEX.md` (Primary) and `GEMINI.md`.
- [x] **Shared Governance:** Centralized rules in `docs/ai/shared-context.md` covering all documentation types (current-state, architecture, security, onboarding).
- [x] **Self-Documenting Repository:** Institutionalized the requirement to evaluate documentation impact before finishing any task.

## Monetization & Plans (UI/UX Foundation)
- [x] **Consolidated Plan Indicators:** High-visibility "Plano Gratuito" / "Plano Business" badges in the Dashboard Header.
- [x] **Contextual Upgrade CTA:** "Fazer Upgrade" button integrated directly into the `PlanBadge` for Free plans, removing sidebar redundancy.
- [x] **Subscription Schema Readiness:** `plan_type` support in the `businesses` table.

## SEO & Discovery
- [x] **Native Next.js 15 Metadata Routes:** Implemented `robots.ts` and `sitemap.ts`.
- [x] **Dynamic Sitemap Generation:** Automated indexing of public businesses and legal pages.
- [x] **Crawler Visibility Infrastructure:** SSR-optimized rankings and above-the-fold content.
- [x] **Visibility Guardrails:** Explicit filtering of frozen, draft, and private businesses from search engines.
- [x] **Discovery Showcase:** Inclusion of demo routes in the sitemap for better product indexing.
- [x] **Localization Cleanup:** Optimized "Explorar" terminology for search intent.

## Testing & Stability (Phase 4)
- [x] Automated Testing Infrastructure (Vitest & React Testing Library).
- [x] Critical E2E and Unit Flow tests (Middleware, Utils, Env Validation).
- [x] Type Safety Hardening (`any` usage reduced, Supabase Types regenerated).
- [x] Safeguards against schema drift and missing profiles.
