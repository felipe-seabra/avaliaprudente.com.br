# AI Tooling Workflows

This document unifies the AI development workflow for Avalia Prudente, outlining when and how to use the different AI agents integrated into our ecosystem.

## 1. The Agents

### Codex CLI
- **Role:** Primary operational runtime for direct IDE-integrated development and structural task execution.
- **Strengths:** Fast execution, excellent for boilerplate, well-integrated into the local development loop, follows strict CI/CD lifecycles.
- **When to Use:** Standard feature implementation, bug fixing, component creation, straightforward API route generation, and immediate IDE-based iterative development.

### Aider
- **Role:** Heavy-lifting agent for long-lived SaaS development, large context persistence, and incremental refactors.
- **Strengths:** Cross-file editing, massive context retention, Git-aware modifications, deep multi-file debugging, and safe application of widespread architectural changes.
- **When to Use:** Large-scale refactorings, complex Supabase schema migrations, cross-cutting architectural overhauls, deep debugging that requires context spanning many files, and major feature development on dedicated branches.

### Gemini CLI
- **Role:** Secondary operational agent and specialized research/analysis tool.
- **Strengths:** Rapid codebase searching (`grep_search`, `glob`), project memory generation, documentation summarization, and speculative architectural investigation.
- **When to Use:** Researching unfamiliar parts of the codebase, generating Architectural Decision Records (ADRs), mapping dependencies, and drafting complex implementation plans before handing off to Codex or Aider.

## 2. Collaboration Flow Between Agents

1. **Research & Plan (Gemini):**
   - Use Gemini CLI to map the codebase, understand the problem, and draft a structured plan or update architectural documentation (`docs/ARCHITECTURE.md`, `project-memory.md`).
2. **Heavy Lifting (Aider):**
   - For complex, multi-file structural changes or massive migrations, invoke Aider to execute the plan, leveraging its deep context understanding and continuous git-backed persistence.
3. **Execution & Polish (Codex):**
   - For focused feature implementation, component styling, or to polish the structural changes established by Aider, use Codex to write code efficiently within the IDE and validate the implementation.
4. **Validation (All Agents):**
   - All agents MUST adhere to the validation pipeline (`lint`, `build`, `test`) and update the `CHANGELOG.md` before committing their work.

## 3. Operational Safety Rules
- **No Direct Main Commits:** Never work directly on `main` for major features. Always utilize branch isolation (`feature/*`, `fix/*`).
- **Validation is Mandatory:** Always run `lint`, `build`, and `tests` before declaring a task complete.
- **Docs First:** Always update documentation (`CHANGELOG.md`, `docs/current-state/*`) as an intrinsic part of the implementation task.
- **Security First:** Never bypass RLS casually. Never disable security protections. Always validate migrations locally via `npm run supabase:reset`.
