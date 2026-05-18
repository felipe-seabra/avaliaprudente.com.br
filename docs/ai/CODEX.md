# CODEX.md — Avalia Prudente: Codex Operational Guide

This document is optimized for GitHub Copilot / Codex sessions, focusing on implementation quality, safe refactoring, and inline code generation within IDEs.

## 1. Repository Architecture
- **Clean Architecture:** Strict separation between `Domain` (entities), `Application` (use cases), `Infrastructure` (repositories/Supabase), and `UI` (Next.js/React).
- **TypeScript Strictness:** Strict mode is enabled. No `any` types. Ensure all interfaces and DTOs are properly defined.

## 2. Implementation Standards
- **UI Components:** Use Radix primitives via `shadcn/ui`. Apply styles using Tailwind CSS 4 (`globals.css` tokens).
- **Data Fetching:** Use Server Components for initial load; use custom hooks (`useBusiness`, etc.) for client-side state.
- **Dependency Mapping:** Before injecting a new repository or service, verify if an abstraction already exists in `src/core/infrastructure/repositories`.

## 3. Refactor Safety Rules
- **No Unrelated Changes:** Codex should NOT suggest formatting or structural changes outside the immediate lines being edited.
- **Preserve RLS & Tenant Context:** When refactoring database queries, ensure `owner_id` filters and RLS compatibility remain intact.
- **RLS Recursion Alert:** Avoid queries to `profiles` within RLS. Use `is_admin()`.
- **Public Filtering:** Ensure public queries explicitly check for `is_frozen = false` where applicable.

## 4. Validation Workflow
- Ensure IDE linters are green before committing.
- Run `npm run build` locally to detect TS/SSR issues caused by inline suggestions.
- **Middleware Safety:** Do not remove or simplify moderation checks in `middleware.ts`.

## 5. Protected Area Warnings
- If editing `middleware.ts` or `supabase/migrations/`, trigger a manual review. Do not trust auto-completions that simplify security checks or remove role guards (`admin` vs `customer`).
- **Admin Bypass:** Verify that refactored logic preserves the Admin Master Bypass.


> **Reference:** For universal governance rules, refer to `docs/ai/shared-context.md`.
