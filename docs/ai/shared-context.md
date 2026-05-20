# Shared AI Context

This file contains the universal governance rules, shared workflows, and operational standards that apply to ALL AI agents (Gemini CLI, Codex, ChatGPT, etc.) working on the Avalia Prudente repository.

## 1. Universal Repository Rules
- **Language:** Code, variables, and commits MUST be in English. Terminal responses/explanations MUST be in Brazilian Portuguese.
- **Frameworks:** Next.js 15 (App Router), Supabase, Tailwind CSS 4, shadcn/ui.
- **Architecture:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Dependencies:** Do NOT install new dependencies without explicit permission.
- **Business Logic:** Do NOT modify core business logic or database schemas unless specifically instructed. Use `npm run supabase:migration` for any schema changes.

## 2. Shared Workflows
- **Analyze First:** Always read relevant code and documentation before suggesting or making changes.
- **Explain Current Flow:** Demonstrate understanding of the current implementation before altering it.
- **Minimal Change Philosophy:** Apply surgical, minimal modifications. Avoid unnecessary refactoring or "cleanups" outside the task scope.
- **Validation Requirement:** Always run `npm run lint`, `npm run build`, and `npm run test` after any code modification.

## 3. Architecture Preservation & Regression Prevention
- Maintain strict multi-tenant isolation (`owner_id` with RLS).
- Do not bypass Middlewares or RLS policies for convenience.
- Ensure that updates to the UI do not break SSR/Server Component compatibility.
- **RLS Safety:** Use `is_admin()` security definer to avoid infinite recursion.
- **Public Visibility:** Filter out `is_frozen = true` items in public lookups.
- **Review Anti-Spam:** Respect the per-business and per-content cooldowns implemented via database triggers. Ensure fingerprints are generated on the client-side for all new reviews.

## 4. Protected Areas
Any modification to the following areas requires extreme caution and a mandatory security review:
- `src/middleware.ts` & `src/lib/supabase/*` (Authentication, Sessions, Account Status).
- `supabase/migrations/*.sql` (RLS & Database Schema).
- `src/providers/root-provider.tsx` & `src/providers/business-provider.tsx` (Global Contexts).
- LGPD / Privacy logic (Terms of Use, Cookie consent, data handling).

## 5. Synchronization & Documentation Updates (Mandatory)
ALL AI agents MUST keep the documentation up-to-date. Every implementation or change must evaluate if updates are required for:
- **`CHANGELOG.md`:** Update upon completing any feature, fix, or architectural change.
- **`docs/current-state/*`:** Keep features, tech debt, and known bugs updated to reflect the reality after the change.
- **`docs/generated/project-memory.md` & `system-map.md`:** Update when architectural patterns, new modules, or significant logic changes occur.
- **Operational Docs:** Update runtime guides (`docs/ai/GEMINI.md`, `docs/ai/CODEX.md`) or operational procedures if workflows change.
- **Architecture & Design:** Update `docs/ARCHITECTURE.md` or ADRs if new patterns are introduced.
- **Onboarding & Security:** Update `docs/ai/onboarding/flows.md` or `docs/ai/rules/security-rules.md` if business flows or security constraints are modified.

**Goal:** The repository must be self-documenting. Never finish implementation without evaluating documentation impact.

## 6. Commit Standards
- Use Conventional Commits (`type(scope): description`) in English.
- Provide atomic commits. Never create generic or broken commits.
- Commit messages should be short and assertive.
