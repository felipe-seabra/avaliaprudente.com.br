# Implemented Features

## Auth & Security
- [x] Multi-tenant RLS (owner_id).
- [x] RBAC (admin/customer).
- [x] Middleware session hardening & central routing.
- [x] Blocked user detection (suspended, banned, deleted).
- [x] Infinite recursion RLS protections (`is_admin` security definer).
- [x] Corrected production redirect URLs (localhost removal).
- [x] Standardized production domain consistency.
- [x] Personalized HTML Email templates (Signup, Reset, Magic Link).
- [x] Centralized Supabase Auth configuration guide.

## Moderation System
- [x] Audit Logs (`moderation_actions`).
- [x] Warnings workflow with automated escalation.
- [x] Temporary Suspensions.
- [x] Permanent Account Bans.
- [x] Account Deactivation (Soft Delete).
- [x] Business Freezing (Hiding from public without deletion).
- [x] Complete Admin Bypass mechanism.

## Core SaaS
- [x] Public Business Page (NFC-ready).
- [x] Drag-and-drop link management.
- [x] Branded QR Code generator.
- [x] Bayesian Ranking system.
- [x] Verification request flow.
- [x] Enforced Onboarding (Mandatory Google Review Link).
- [x] Verification Eligibility Rules (Checklist of requirements).
- [x] Interactive Google Review Tutorial.
- [x] Draft/Unpublished states for business pages.

## Public Flow
- [x] 1-5 Star Rating system.
- [x] Conditional Google redirection.
- [x] Private feedback capture.
- [x] Logo & branding uploads.

## Testing & Stability (Phase 4)
- [x] Automated Testing Infrastructure (Vitest & React Testing Library).
- [x] Critical E2E and Unit Flow tests (Middleware, Utils, Env Validation).
- [x] Type Safety Hardening (`any` usage reduced, Supabase Types regenerated).
- [x] Safeguards against schema drift and missing profiles.
