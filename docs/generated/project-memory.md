# Project Memory: Avalia Prudente

## Context
SaaS platform for Google review acquisition via NFC/QR Codes. Multi-tenant (RLS-based). Clean Architecture.

## Architecture
- **Framework:** Next.js 15 (App Router).
- **Persistence:** Supabase (Auth, RLS, Storage).
- **Core:** `Domain` (entities), `Infrastructure` (repos), `UI` (components/hooks).
- **Isolation:** Strict RLS via `owner_id`. Admin roles for moderation.

## Critical Business Rules
- **Intelligent Redirect:** Rating >= 4 -> Google; < 4 -> Internal Feedback.
- **Authenticated Reviews:** New review submissions require Supabase Auth through Google OAuth or Magic Link, with public attribution limited to `display_name`.
- **Anti-Abuse Preservation:** Authenticated reviews still use trusted server-side fingerprints and database cooldown triggers.
- **Bayesian Ranking:** Weighted score based on volume, average rating, and verification status.
- **Verification:** Formal request-approve-verify flow. Admins can force status.
- **Page Editor:** Drag-and-drop link ordering (dnd-kit).

## Sensitive Modules
- `src/middleware.ts`: RBAC & Session hardening.
- `src/providers/business-provider.tsx`: Multi-tenant context management.
- `supabase/migrations/`: RLS & Schema source of truth.
