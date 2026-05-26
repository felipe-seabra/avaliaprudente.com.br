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
- [x] **Distributed Rate Limiting (Edge Compatible):** Multi-tier protection using Upstash Redis to prevent DDoS, brute force, and API abuse across serverless instances.
- [x] **Session Security & CSRF Hardening:** Strict `Origin` vs `Host` validation for all API route handlers, paired with robust Security Headers (CSP, X-Frame-Options).
- [x] **Trusted Webhook Boundaries:** Architected `/api/webhooks/stripe` bypasses for CSRF with requirements for cryptographic signature validation.
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
- [x] **Centralized Moderation Scope Architecture:** Formalized "Public Scopes" and Database Views to ensure consistent visibility across all public surfaces.

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

## Monetization & Entitlements
- [x] **Subscription System (Foundation)**
    - [x] **Provider-Agnostic Architecture:** Decoupled billing from authorization logic.
    - [x] **Internal Authorization State:** Database-driven entitlements as the source of truth.
    - [x] **Single Source of Truth:** Centralized plan definitions in `src/lib/subscription-config.ts`.
    - [x] **Entitlement Layer:** Centralized server-side (`canUseFeature`) and client-side (`useSubscription`) resolution.
    - [x] **Super Admin Bypass:** Model-level bypass in the entitlement resolver (unlimited access).
    - [x] **Feature Gating:** Consistent UI/UX components for premium feature restrictions.
    - [x] **Admin Subscription Management:** Sudo-protected tools for manual plan overrides and status control.
    - [x] **Quota Enforcement:** Hard limits for businesses and monthly review volume.
    - [x] **Entitlement Auditing:** Tamper-resistant logs for all commercial state changes.

## Operational Governance
- [x] **Security Observability Dashboard:** Production-safe internal dashboard for `super_admin` users to monitor audit logs, security violations, and privileged actions.
- [x] **Audit Logging Foundation:** Tamper-resistant infrastructure for capturing system-wide security and administrative events.
- [x] **Metadata Sanitization Engine:** Automated redaction of sensitive PII in observability logs to prevent administrative data leaks.
- [x] **Mandatory Documentation Sync:** Unified rule for all AI agents to keep documentation and changelog updated.
- [x] **Completion Workflows:** Explicitly defined lifecycle (Implement -> Lint -> Build -> Test -> Docs -> Commit) in `CODEX.md` (Primary) and `GEMINI.md`.
- [x] **Shared Governance:** Centralized rules in `docs/ai/shared-context.md` covering all documentation types (current-state, architecture, security, onboarding).
- [x] **Self-Documenting Repository:** Institutionalized the requirement to evaluate documentation impact before finishing any task.
