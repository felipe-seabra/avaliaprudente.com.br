# Shared AI Context

This file contains the universal governance rules, shared workflows, and operational standards that apply to ALL AI agents (Gemini, Codex, ChatGPT, etc.) working on the Avalia Prudente repository.

## 1. Universal Repository Rules
- **Language:** Code, variables, and commits MUST be in English. Terminal responses/explanations MUST be in Brazilian Portuguese.
- **Frameworks:** Next.js 15 (App Router), Supabase, Tailwind CSS 4, shadcn/ui.
- **Architecture:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Dependencies:** Do NOT install new dependencies without explicit permission.
- **Business Logic:** Do NOT modify core business logic or database schemas unless specifically instructed.

## 2. Shared Workflows
- **Analyze First:** Always read relevant code and documentation before suggesting or making changes.
- **Explain Current Flow:** Demonstrate understanding of the current implementation before altering it.
- **Minimal Change Philosophy:** Apply surgical, minimal modifications. Avoid unnecessary refactoring or "cleanups" outside the task scope.
- **Validation Requirement:** Always run `npm run lint` and `npm run build` after any code modification.

## 3. Architecture Preservation & Regression Prevention
- Maintain strict multi-tenant isolation (`owner_id` with RLS).
- Do not bypass Middlewares or RLS policies for convenience.
- Ensure that updates to the UI do not break SSR/Server Component compatibility.

## 4. Protected Areas
Any modification to the following areas requires extreme caution and a mandatory security review:
- `src/middleware.ts` & `src/lib/supabase/*` (Authentication & Sessions)
- `supabase/migrations/*.sql` (RLS & Database Schema)
- `src/providers/business-provider.tsx` (Tenant Context)
- LGPD / Privacy logic (Cookie consent, data handling)

## 5. Synchronization & Documentation Updates
ALL AI agents MUST keep the documentation up-to-date:
- **`CHANGELOG.md`:** Update upon completing a feature or fix.
- **`docs/generated/project-memory.md` & `system-map.md`:** Update when architectural patterns change.
- **`docs/current-state/*`:** Keep features, tech debt, and known bugs updated.
- **`docs/ai/shared-context.md`:** Update if fundamental governance changes.

## 6. Commit Standards
- Use Conventional Commits (`type(scope): description`).
- Provide atomic commits. Never create generic or broken commits.
