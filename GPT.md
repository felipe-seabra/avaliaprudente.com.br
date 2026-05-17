# GPT.md — Avalia Prudente: AI Intelligence Layer

Este documento é a fonte consolidada de inteligência técnica e operacional do projeto **Avalia Prudente**, otimizado para reconstrução rápida de contexto em novas sessões de IA (ChatGPT, Codex, Gemini).

## 1. Project Overview
- **Purpose:** Production-ready SaaS for Google review acquisition via NFC/QR Codes.
- **Domain:** Local business reputation and NFC-powered modular landing pages.
- **Architecture:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Multi-tenant:** Strict isolation via Row Level Security (RLS) in Supabase using `owner_id`.
- **Runtime:** Next.js 15 (Edge/Node.js compatible).
- **Deployment:** Vercel + Supabase Cloud.

## 2. Technical Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui.
- **Backend:** Supabase (Auth, Storage, Edge Functions, PostgreSQL).
- **State:** React Context (`BusinessProvider`), Custom Hooks (`useBusiness`, `useBusinessPage`).
- **Forms:** React Hook Form + Zod.
- **Tooling:** npm, ESLint, Prettier.
- **Commands:** `npm run lint`, `npm run build`, `npx supabase migration new`.

## 3. Architecture Summary
- **Modular Pages:** Businesses have customizable public pages (`/[slug]`) with modular CTA blocks.
- **Service Boundaries:** Logic encapsulated in Repositories (`src/core/infrastructure/repositories`).
- **Middleware:** Centralized session management, role-based protection (Admin/Customer), and rate limiting.
- **Communication:** Clean data flow from UI hooks to Supabase repositories.

## 4. Critical Business Rules
- **Intelligent Redirect:** Rating >= 4 -> Google; < 4 -> Internal Feedback.
- **Bayesian Ranking:** Weighted "Elite da Cidade" score based on volume, average, and verification status.
- **Verification Flow:** Request -> Admin Review -> Approve/Reject. No self-verification allowed.
- **Tenant Isolation:** Users only see/edit businesses where `owner_id = auth.uid()`.

## 5. Protected Areas (High Risk)
- **Auth & Sessions:** `middleware.ts`, `lib/supabase/middleware.ts`.
- **RLS Policies:** `supabase/migrations/*.sql`.
- **Tenant Context:** `BusinessProvider`, propagation of `business_id`.
- **Verification Logic:** Ranking algorithm and verification status triggers.

## 6. Technical Debt
- **Missing Application Layer:** Hooks currently call repositories directly; need `Application` Use Cases.
- **In-memory Rate Limit:** Resets on server restart; needs distributed Redis (Upstash).
- **Repo Coupling:** Repositories instantiated via `new` inside hooks; needs Dependency Injection.
- **Split Repos:** Consolidate/split large repository files (e.g., `supabase-page-repository.ts`).

## 7. Known Bugs & Regressions
- **Bugs:** Minor theme flash, in-memory rate limit reset, occasional business switcher sync delay.
- **Regressions:** Historically sensitive to RLS infinite recursion and Storage public access misconfiguration.

## 8. Development Governance
- **Philosophy:** Analyze first -> Explain flow -> Minimal surgical changes -> Validate.
- **Validation:** Mandatory `npm run lint` and `npm run build` after any change.
- **Commits:** Conventional Commits in **English**. Responses in **Portuguese**.

## 9. AI Agent Modes (Specialized Workflows)
- **Architect:** Structure, ADRs, entities. No UI code.
- **Implementer:** Features, components, hooks. No RLS changes.
- **Debugger:** Root cause analysis before fixing. No refactors.
- **Reviewer:** Code auditing via `review-checklist.md`.
- **Security-Reviewer:** Deep-dive into RLS, Middleware, and multi-tenancy.
- **Documentation:** Memory, ADRs, state tracking.
- **Refactor:** Tech debt reduction with 100% behavioral consistency.

## 10. Important Repository Files
- `GEMINI.md`: Root AI entrypoint and operational rules.
- `docs/rules/*`: Immutable governance and security rules.
- `docs/generated/*`: Dynamic project memory and system map.
- `docs/adr/*`: History of architectural decisions.
- `src/middleware.ts`: Core security gateway.

## 11. Current Priorities
1. **Stabilization:** Decouple repositories from hooks via Use Cases.
2. **Infrastructure:** Transition to distributed rate limiting.
3. **Admin Tools:** Enhancing moderation dashboard and verification UX.
