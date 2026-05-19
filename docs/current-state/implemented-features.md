# Implemented Features

## Auth & Security
- [x] Multi-tenant RLS (owner_id).
- [x] RBAC (admin/customer).
- [x] Middleware session hardening & central routing.
- [x] Blocked user detection (suspended, banned, deleted).
- [x] Infinite recursion RLS protections (`is_admin` security definer).

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
