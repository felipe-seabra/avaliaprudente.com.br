# AI Onboarding Flow

This directory details how to start and manage sessions across different AI agents. **Codex CLI and Aider are the recommended primary agents for this repository.**

## 1. Starting an Aider Session (Primary for Architecture/Refactors)
1. Clone the repository and install dependencies (`npm install`).
2. Ensure you have read `docs/ai/AIDER.md` and `docs/ai/AI_WORKFLOWS.md`.
3. Create a new branch: `git checkout -b feature/my-feature`.
4. Launch Aider: `aider`.
5. Add relevant context files using `/add` (e.g., `/add docs/ai/shared-context.md src/app/page.tsx`).
6. Provide the initial structural task. Aider will automatically commit upon successful execution.
7. **Validation Expectation:** You MUST manually trigger or instruct Aider to run `npm run lint`, `npm run build`, and `npm run test` before finalizing the branch.

## 2. Starting a Codex CLI Session (Primary for Features/IDE)
1. Clone the repository and install dependencies (`npm install`).
2. Ensure you have read `docs/ai/CODEX.md`.
3. Codex CLI operates as a terminal-native autonomous agent integrated with your IDE.
4. Provide the initial task and ensure the agent performs local analysis before execution.
5. **Validation Expectation:** Codex CLI must autonomously validate all changes (lint/build/test) and follow the commit discipline defined in `CODEX.md`.

### Public Review Auth Context (Important Note)
- New review submissions require authenticated Supabase sessions through Google OAuth or Magic Link.
- Preserve the redirect contract `/auth/callback?next=/r/{slug}?review=1` when changing auth or review flows.
- Validate callback `next` values server-side and allow only internal redirects.
- Public review identity must remain limited to `display_name`; do not expose e-mail or provider metadata.

## 3. Starting a Gemini CLI Session (Secondary/Research)
1. Clone the repository and install dependencies (`npm install`).
2. Ensure you have read `docs/ai/GEMINI.md`.
3. Gemini CLI will automatically parse the workspace and its context.
4. If working on a specific feature, direct the agent to read `docs/current-state/implemented-features.md` to avoid duplicating work.
5. **Validation Expectation:** Gemini CLI must autonomously run lint, build, and commit changes using Conventional Commits.

## 4. Starting a Codex / GitHub Copilot Session (IDE)
1. Codex operates directly within the IDE.
2. Ensure the developer has opened `docs/ai/CODEX.md` so the AI context window absorbs the architectural constraints.
3. Use Copilot Chat for targeted questions like "Explain the tenant isolation in this repository based on CODEX.md".
4. **Validation Expectation:** Codex provides inline suggestions. The developer must manually run `npm run lint` and `npm run build`.

## 5. Starting a ChatGPT Session
1. Copy the contents of `docs/ai/GPT.md` and paste it into your first ChatGPT prompt.
2. **Context Loading Prompt:** "Read the following project intelligence document to understand the architecture, tech debt, and governance. Acknowledge and await my first instruction."
3. Once ChatGPT acknowledges the context, specify the AI Mode (e.g., "Act as the Architect and help me draft an ADR for...").
4. **Validation Expectation:** ChatGPT provides implementation plans and code snippets. The user is responsible for integrating, linting, and building.
