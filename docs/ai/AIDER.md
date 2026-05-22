# AIDER.md — Avalia Prudente: Aider Operational Guide

Aider is deeply integrated into the Avalia Prudente development workflow for continuous, large-context, and complex architectural refactors. This guide establishes the mandatory rules and context for Aider sessions.

> **Universal Rules:** All actions must strictly adhere to `docs/ai/shared-context.md`.

## 1. Role and Operational Scope
Aider is the preferred agent for:
- Large-scale refactoring and incremental codebase evolution.
- Cross-file architectural changes.
- Complex Supabase migration implementation and schema evolution.
- Deep, multi-turn debugging sessions requiring high context retention.

## 2. Project Architecture & Standards
- **Framework:** Next.js 15 (App Router), React, TypeScript (strict).
- **Styling:** Tailwind CSS 4, shadcn/ui.
- **Data & Auth:** Supabase (PostgreSQL, GoTrue, Storage).
- **Design Pattern:** Clean Architecture (`src/core/domain`, `application`, `infrastructure`).
- **UX/UI Standards:** Premium SaaS feel, mobile-first, semantic HTML, proper accessibility labels.

## 3. Database & Supabase Expectations
- **RLS (Row Level Security):** NEVER bypass RLS casually. Use `is_admin()` or `is_super_admin()` security definer functions to prevent infinite recursion on the `profiles` table. Ensure RLS policies protect tenant data (`owner_id`) and authenticated user data (`user_id`).
- **Migrations:** ALWAYS use `npm run supabase:migration` to manage schema changes. Never modify the database directly via external scripts without an approved ADR.
- **Validation:** Always validate migrations locally with `npm run supabase:reset`.

## 4. Authentication & Security (LGPD)
- **Auth Flow:** Users authenticate via Google OAuth (primary) or Magic Link (fallback).
- **Review Ownership Architecture:** Reviews are identity-owned (UNIQUE `user_id` and `business_id`). The API enforces UPSERT behavior for successive submissions from the same user to the same business. Authenticated reviewers manage their reviews via the Reviewer Dashboard (`/account`).
- **Security:** Do NOT expose raw emails or auth provider metadata publicly. Only `display_name` is exposed publicly for reviews.
- **Redirects:** Use absolute URLs derived from `APP_CONFIG.url` to prevent session inconsistencies and open redirects during OAuth and Magic Link flows (`/auth/callback`).

## 5. Branch Workflow & Production Safety
- **Branch Isolation:** NEVER work directly on `main` for major features. Always create and use a feature branch (e.g., `feature/*`, `fix/*`, `chore/*`).
- **Production Integrity:** Preserve production stability. Do not disable security protections or bypass established anti-fraud measures permanently.
- **Environment:** Respect Vercel and Supabase cloud expectations. Use `src/lib/env.ts` for strict environment variable validation.

## 6. Development Workflow (Mandatory Lifecycle)
Every feature or fix executed by Aider MUST follow:
1. **Implement:** Write code adhering to Clean Architecture and project conventions.
2. **Lint:** `npm run lint`.
3. **Build:** `npm run build`.
4. **Test:** `npm run test -- --run`.
5. **Docs Update:** Update `CHANGELOG.md` under `[Unreleased]`, architectural docs, and project memory.
6. **Commit:** Provide atomic commits using Conventional Commits.
