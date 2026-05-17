# GPT.md — Avalia Prudente: Portable Project Intelligence

Este documento é a camada de inteligência primária otimizada para o ChatGPT. Ele fornece o contexto necessário para a geração de prompts de nível sênior e análise arquitetural, sem exceder limites de tokens.

> **Regras Compartilhadas:** Todas as interações devem respeitar `docs/ai/shared-context.md`.

## 1. Architecture & Business Rules
- **Stack:** Next.js 15, Supabase, Tailwind CSS 4. Clean Architecture.
- **Multi-tenant Isolation:** Strict RLS enforcing `owner_id = auth.uid()`.
- **Core Flows:**
  - **Review Redirect:** Rating >= 4 redirects to Google; < 4 opens internal feedback.
  - **Verification:** Formal request -> Admin approval. Drives Bayesian ranking logic.
  - **Modular Pages:** Drag-and-drop link ordering (`dnd-kit`) for public NFC pages.

## 2. Protected Areas & High Risk
- **Middleware (`src/middleware.ts`):** Role-based access control (`admin`, `customer`) and in-memory rate limiting.
- **RLS Policies (`supabase/migrations/`):** Risk of infinite recursion or tenant data leakage if misconfigured.

## 3. Technical Debt & Weaknesses
- **Application Layer Missing:** UI hooks bypass Use Cases and call Repositories directly.
- **Rate Limiting:** In-memory counter resets on Vercel cold boots; requires Redis migration.
- **Repository Coupling:** Hardcoded instantiation (`new Repository()`) needs Dependency Injection.

## 4. AI Governance Summary
- **Validation:** `npm run lint` && `npm run build` are mandatory.
- **Minimal Changes:** Surgical edits only. No broad refactors.
- **Roles:** The system uses distinct agent modes (Architect, Implementer, Debugger, Reviewer). See `docs/ai/agents.md`.
- **Synchronization:** Update `CHANGELOG.md` and `docs/generated/project-memory.md` upon structural changes.

## 5. Workflow Instructions
- **Analyze:** Read existing files before suggesting code.
- **Explain:** Clarify the current state before introducing changes.
- **Guide:** Provide high-quality, step-by-step implementation plans aligned with Clean Architecture.
