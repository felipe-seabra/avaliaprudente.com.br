# GEMINI.md — Avalia Prudente: Gemini CLI Operational Guide

This document is the official entrypoint for Gemini CLI execution workflows.

> **Universal Rules:** All actions must strictly adhere to `docs/ai/shared-context.md`.

## 1. Repository Execution Workflow
- **Local Analysis:** Use `grep_search`, `list_directory`, and `read_file` to map the codebase before executing changes.
- **Empirical Validation:** Prioritize reproducing bugs or validating current state locally.
- **Automated Validation:** After any code modification, run `npm run lint` and `npm run build`. Fix all errors autonomously before proceeding.

## 2. Commit Flow & Project Memory
- **Changelog:** Update `CHANGELOG.md` under the `[Unreleased]` or current version tag.
- **State Updates:** If the architecture, tech debt, or implemented features change, update the corresponding files in `docs/current-state/` and `docs/generated/`.
- **Git Commit:** Stage only the specific files modified for the task. Use Conventional Commits in English. Do NOT push to remote unless explicitly asked.

## 3. Tool Usage Strategy
- **Surgical Edits:** Use `replace` for targeted edits. Ensure `old_string` matches exactly.
- **Read Efficiency:** Avoid reading entire files if only a specific section is needed (use `start_line` and `end_line`).
- **Parallelism:** Execute independent read/search tools concurrently to save turns.

## 4. Protected Areas
- Do not run arbitrary bash scripts that modify database schemas without verifying against `docs/ai/rules/database-rules.md` and `docs/ai/rules/protected-areas.md`.
