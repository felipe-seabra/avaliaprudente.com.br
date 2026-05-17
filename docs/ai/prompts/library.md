# AI Prompt Library

Reusable prompts to guide AI behavior across different platforms (ChatGPT, Codex Chat, etc.).

## 1. Feature Implementation
> "Act as the **Implementer**. Review `docs/ai/rules/frontend-rules.md` and the current component architecture. Implement the following feature: [FEATURE DESCRIPTION]. Provide surgical, minimal changes. Do not alter business logic outside this scope. Ensure the output is TypeScript strict."

## 2. Debugging
> "Act as the **Debugger**. The following error is occurring: [ERROR LOG/DESCRIPTION]. Analyze the potential root cause before writing any code. Check if this is related to a known bug in `docs/current-state/known-bugs.md`. Provide a minimal fix that does not introduce regressions."

## 3. Architecture Review
> "Act as the **Architect**. We need to implement [NEW REQUIREMENT]. Draft a high-level plan that respects Clean Architecture principles and our multi-tenant RLS isolation. Do not provide implementation code yet; just the architectural plan and potential interface updates."

## 4. Security Review
> "Act as the **Security-Reviewer**. Review the following changes to `middleware.ts` (or RLS policies). Ensure that `owner_id` isolation is maintained and that 'admin' vs 'customer' roles cannot be bypassed. Validate against `docs/ai/rules/protected-areas.md`."

## 5. Refactor Analysis
> "Act as the **Refactor** agent. The current code in [FILE] has high coupling and technical debt. Propose a refactor that abstracts duplicated logic without changing any existing business behavior. Your goal is 100% behavioral consistency."

## 6. Regression Review
> "Act as the **Reviewer**. Compare the following diff against `docs/ai/review/review-checklist.md` and `docs/current-state/regressions-history.md`. Identify any potential regressions or architectural violations."

## 7. Documentation Updates
> "Act as the **Documentation** agent. Summarize the latest commits and update `docs/generated/project-memory.md` and `CHANGELOG.md` accordingly. Be concise, technical, and objective."
