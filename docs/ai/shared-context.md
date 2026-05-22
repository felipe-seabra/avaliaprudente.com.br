# Shared AI Context

This file contains the universal governance rules, shared workflows, and operational standards that apply to ALL AI agents (Codex CLI, Aider, Gemini, ChatGPT, etc.) working on the Avalia Prudente repository. **Codex CLI and Aider are the primary operational agents for this repository.**

## 1. Universal Repository Rules
- **Primary Agents:** Codex CLI (IDE/focused features) and Aider (refactoring/large context) are the official runtime agents.
- **Language:** Code, variables, and commits MUST be in English. Terminal responses/explanations MUST be in Brazilian Portuguese.
- **Frameworks:** Next.js 15 (App Router), Supabase, Tailwind CSS 4, shadcn/ui.
- **Architecture:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Dependencies:** Do NOT install new dependencies without explicit permission.
- **Business Logic:** Do NOT modify core business logic or database schemas unless specifically instructed. Use `npm run supabase:migration` for any schema changes.

## 2. Shared Workflows (Mandatory Lifecycle)
Every task executed by ANY agent MUST follow this sequence:
1. **Branch Isolation:** Create a feature branch before major changes. Never work directly on `main`.
2. **Implement:** Perform the technical change.
3. **Lint:** Run `npm run lint`.
4. **Build:** Run `npm run build`.
5. **Test:** Run `npm run test -- --run`.
6. **Update Docs:** Evaluate and update `CHANGELOG.md`, `docs/current-state/*`, and other relevant docs.
7. **Commit:** Commit ONLY after all previous steps pass.

- **Analyze First:** Always read relevant code and documentation before suggesting or making changes.
- **Explain Current Flow:** Demonstrate understanding of the current implementation before altering it.
- **Minimal Change Philosophy:** Apply surgical, minimal modifications. Avoid unnecessary refactoring or "cleanups" outside the task scope.

## 3. Architecture Preservation & Regression Prevention
- Maintain strict multi-tenant isolation (`owner_id` with RLS).
- Do not bypass Middlewares or RLS policies for convenience.
- Ensure that updates to the UI do not break SSR/Server Component compatibility.
- **RLS Safety:** Use `is_admin()` or `is_super_admin()` security definer to avoid infinite recursion.
- **Public Visibility:** Filter out `is_frozen = true` items in public lookups.
- **Review Ownership & Anti-Spam:** Reviews are identity-owned (UNIQUE `user_id` and `business_id`). The API enforces UPSERT behavior. Respect the per-business cooldowns implemented via database triggers. Ensure fingerprints are generated on the client-side for all new reviews.

## 4. Protected Areas
Any modification to the following areas requires extreme caution and a mandatory security review:
- `src/middleware.ts` & `src/lib/supabase/*` (Authentication, Sessions, Account Status).
- `supabase/migrations/*.sql` (RLS & Database Schema).
- `src/providers/root-provider.tsx` & `src/providers/business-provider.tsx` (Global Contexts).
- LGPD / Privacy logic (Terms of Use, Cookie consent, data handling, display name usage).

## 5. Synchronization & Documentation Updates (Mandatory)
ALL AI agents MUST keep the documentation up-to-date. Every implementation or change must evaluate if updates are required for:
- **`CHANGELOG.md`:** Update upon completing any feature, fix, or architectural change.
- **`docs/current-state/*`:** Keep features, tech debt, and known bugs updated to reflect the reality after the change.
- **`docs/generated/project-memory.md` & `system-map.md`:** Update when architectural patterns, new modules, or significant logic changes occur.
- **Operational Docs:** Update runtime guides (`docs/ai/AIDER.md`, `docs/ai/CODEX.md`) or operational procedures if workflows change.
- **Architecture & Design:** Update `docs/ARCHITECTURE.md` or ADRs if new patterns are introduced.
- **Onboarding & Security:** Update `docs/ai/onboarding/flows.md` or `docs/ai/rules/security-rules.md` if business flows or security constraints are modified.

**Goal:** The repository must be self-documenting. Never finish implementation without evaluating documentation impact.

## 6. Commit Standards
- Use Conventional Commits (`type(scope): description`) in English.
- Provide atomic commits. Never create generic or broken commits.
- Commit messages should be short and assertive.
