# Avalia Prudente - AI Governance & Operational Guide

## 1. Project Overview
- **Project:** Avalia Prudente
- **Goal:** Production-ready SaaS for Google review acquisition via NFC/QR Codes.
- **Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS 4, shadcn/ui.
- **Runtime:** Edge/Node.js compatible.
- **Architecture:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Multi-tenant Structure:** Strict row-level security (RLS) isolation via `owner_id`.
- **Critical Services:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).

## 2. AI Operational Responsibilities
- **Preserve Architecture:** Follow the established Clean Architecture principles strictly.
- **Minimize Regressions:** Thoroughly test edges and avoid breaking existing flows.
- **Prefer Minimal Changes:** Make only surgical, required modifications.
- **Avoid Unnecessary Refactors:** Do NOT refactor code or abstractions unrelated to the immediate task.
- **Maintain Consistency:** Adhere strictly to the defined visual, structural, and coding patterns.

## 3. Mandatory Session Startup
Every AI session MUST begin by reading and acknowledging the following files:
- `docs/generated/project-memory.md`
- `docs/generated/system-map.md`
- `docs/rules/*` (Architecture, Backend, Frontend, Database, Security, Commit)
- `docs/current-state/*`
- `docs/workflows/*`
- `docs/rules/protected-areas.md`

## 4. Mandatory Development Workflow
1. **Analyze First:** Read related code, docs, and memory before modifying anything.
2. **Explain Current Flow:** Describe how the system currently works to the user to validate understanding.
3. **Implement Minimal Changes:** Make surgical changes required to accomplish the task.
4. **Validate Lint/Build:** ALWAYS run `npm run lint` and `npm run build` after modifications.
5. **Update Documentation:** Update `CHANGELOG.md` and `docs/current-state/*` if necessary.
6. **Create Commit:** Create an atomic, specific commit following Conventional Commits.

## 5. Protected Areas
The following areas require extreme caution. See `docs/rules/protected-areas.md` for full checklists:
- **Authentication & Sessions:** (`src/middleware.ts`, `src/lib/supabase/*`)
- **Row Level Security (RLS) & Permissions:** (`supabase/migrations/*.sql`)
- **Multi-tenant Logic:** Tenant propagation, `BusinessProvider`, data leakage risks.
- **Billing/Subscription Flows:** Upgrades, payment webhooks.
- **LGPD/Privacy Logic:** Cookie consent, data deletion.

## 6. Validation Rules
- **Lint Required:** Never skip `npm run lint`.
- **Build Required:** Never skip `npm run build`.
- **No Broken Commits:** All committed code MUST compile and pass linting.
- **No Generic Commits:** Provide clear, technical context in commit messages (e.g., `fix(auth): prevent session refresh loop`).

## 7. Communication Rules
- **Responses:** All terminal responses and explanations must be in **Brazilian Portuguese**.
- **Commits & Code:** All code, variables, functions, and commit messages must be in **English**.
- **Format:** Use the Conventional Commits format (`type(scope): description`).

## 8. Documentation Map
- **`docs/generated/`**: Persistent project memory, architecture context, and dynamic technical state.
- **`docs/current-state/`**: Ephemeral state tracking (`implemented-features.md`, `known-bugs.md`, `technical-debt.md`).
- **`docs/workflows/`**: Execution procedures for features, debugging, reviewing, and releasing.
- **`docs/review/`**: Standardized AI review checklists.
- **`docs/rules/`**: Immutable governance rules, coding standards, and security constraints.
- **`docs/adr/`**: Architectural Decision Records detailing major technical choices.
- **`docs/ai/agents.md`**: Specialized AI role definitions and workflow segmentation.
