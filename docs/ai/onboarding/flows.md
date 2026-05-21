# AI Onboarding Flow

This directory details how to start and manage sessions across different AI agents. **Codex CLI is the recommended primary agent for this repository.**

## 1. Starting a Codex CLI Session (Primary)
1. Clone the repository and install dependencies (`npm install`).
2. Ensure you have read `docs/ai/CODEX.md`.
3. Codex CLI operates as a terminal-native autonomous agent.
4. Provide the initial task and ensure the agent performs local analysis before execution.
5. **Validation Expectation:** Codex CLI must autonomously validate all changes (lint/build/test) and follow the commit discipline defined in `CODEX.md`.

## 2. Starting a Gemini CLI Session (Secondary)
1. Clone the repository and install dependencies (`npm install`).
2. Ensure you have read `docs/ai/GEMINI.md`.
3. Gemini CLI will automatically parse the workspace and its context.
4. If working on a specific feature, direct the agent to read `docs/current-state/implemented-features.md` to avoid duplicating work.
5. **Validation Expectation:** Gemini CLI must autonomously run lint, build, and commit changes using Conventional Commits.

## 3. Starting a Codex / GitHub Copilot Session (IDE)
1. Codex operates directly within the IDE.
2. Ensure the developer has opened `docs/ai/CODEX.md` so the AI context window absorbs the architectural constraints.
3. Use Copilot Chat for targeted questions like "Explain the tenant isolation in this repository based on CODEX.md".
4. **Validation Expectation:** Codex provides inline suggestions. The developer must manually run `npm run lint` and `npm run build`.

## 4. Starting a ChatGPT Session
1. Copy the contents of `docs/ai/GPT.md` and paste it into your first ChatGPT prompt.
2. **Context Loading Prompt:** "Read the following project intelligence document to understand the architecture, tech debt, and governance. Acknowledge and await my first instruction."
3. Once ChatGPT acknowledges the context, specify the AI Mode (e.g., "Act as the Architect and help me draft an ADR for...").
4. **Validation Expectation:** ChatGPT provides implementation plans and code snippets. The user is responsible for integrating, linting, and building.
