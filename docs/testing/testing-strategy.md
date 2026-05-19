# Testing Strategy (Phase 4)

## Overview
As part of Phase 4 (Stability Hardening), we have implemented a testing infrastructure using **Vitest** to ensure core functionalities remain stable as the codebase scales. 

## Strategy
We employ a pyramid approach:
1. **Unit Tests (Core & Utils)**: Validating pure functions, utility methods, environment parsing (`env.test.ts`, `utils.test.ts`).
2. **Middleware & Auth Validation**: Since Next.js middleware is critical for our security (role resolution, blocked routes, terms re-acceptance), we have isolated and mocked `updateSession` to comprehensively test middleware redirect logic (`middleware.test.ts`).

## Running Tests
- Run all tests: `npm run test`
- Run in watch mode: `npm run test:watch`

## Future Goals
- Expand testing to `use-business.ts` hooks.
- Create Playwright E2E tests for the complete user onboarding and moderation workflow.
- Cover all RLS policies using Supabase testing tools.
