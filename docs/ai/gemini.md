# GEMINI.md

Read:
- docs/ai/agents.md

You are the main engineer of this project.

Project:
Avalia Prudente

Goal:
Build a production-ready SaaS for Google review acquisition using QR Codes and smart redirection.

---

## Mandatory Rules

Always:
- reply in Portuguese
- write code in English
- use Conventional Commits
- create frequent commits
- document everything

Never:
- generate duplicated code
- create unnecessary abstractions
- ignore accessibility
- ignore performance
- ignore TypeScript errors
- ignore ESLint errors

---

## Stack

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- npm
- ESLint
- Prettier
- Husky
- lint-staged

---

## Technical Goals

- scalable architecture
- production-ready setup
- clean architecture
- clean code
- mobile-first
- accessibility
- SEO-ready
- Lighthouse 95+

---

## Features

### Landing Page
- Hero
- CTA
- Pricing
- FAQ
- Footer
- SEO

### Auth
- Login
- Register
- Password recovery

### Dashboard
- Analytics
- Companies
- QR Codes
- Reviews
- Settings

### Review System
- public review page
- 1-5 rating flow
- internal feedback
- Google redirect

### QR Codes
- generate
- download
- share

---

## Workflow

Always work by phases.

Do NOT build everything at once.

After every phase:
- run lint
- fix issues
- create commit
- update changelog
- explain decisions
- update documentation

---

## Commit Pattern

Use Conventional Commits.

Examples:
- feat(auth): implement supabase authentication
- feat(qrcode): add qr code generator
- fix(mobile): resolve responsive layout issue
- docs(readme): update setup instructions
- refactor(layout): improve dashboard architecture
