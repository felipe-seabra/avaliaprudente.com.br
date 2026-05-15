# AGENTS.md

## Core Rules

Always:
- reply in Portuguese
- write code in English
- use English for variables, functions, components and commits
- use Conventional Commits
- create frequent commits
- update documentation after major changes

---

## Stack

- Next.js 15
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- Vercel
- ESLint
- Prettier
- Husky
- lint-staged
- npm

---

## Architecture

Required:
- clean architecture
- clean code
- SOLID
- DRY
- KISS
- scalable structure
- mobile-first
- accessibility
- SEO-ready
- high performance

Never:
- use any
- create giant components
- duplicate logic
- duplicate services
- duplicate hooks
- duplicate types
- ignore lint errors
- ignore TypeScript errors

Before creating files:
- search existing implementations
- reuse abstractions
- avoid duplicate code

---

## UI / UX

Design style:
- premium SaaS
- minimal
- modern
- smooth animations
- responsive
- dark/light mode

References:
- Stripe
- Linear
- Vercel
- Notion
- Raycast

Always:
- prioritize mobile UX
- create loading states
- create empty states
- create skeleton loaders
- maintain visual consistency

---

## Database

Use:
- Supabase
- RLS
- migrations
- seeds
- typed queries

---

## Main Flow

Review flow:
1. User scans QR Code
2. User selects rating
3. Rating >= 4:
   redirect to Google Reviews
4. Rating < 4:
   save internal feedback

---

## Workflow

Work in small phases.

Never build the entire project at once.

Recommended phases:
1. setup and architecture
2. auth and database
3. landing page
4. dashboard
5. review flow
6. QR codes
7. analytics
8. SEO and accessibility
9. refinements

After each phase:
- run lint
- fix issues
- create commit
- update changelog
- document decisions

If context becomes too large:
- stop generating code
- summarize architecture
- explain next steps
