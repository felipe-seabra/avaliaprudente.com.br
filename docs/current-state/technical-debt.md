# Technical Debt

## Architecture
- [ ] Implement `Application` layer (Use Cases) to fully decouple UI from Infra.
- [ ] Refactor repository instantiation (Dependency Injection).

## Infra
- [ ] Replace in-memory rate limiting with distributed Redis (Upstash).
- [ ] Increase automated test coverage (RLS & Ranking logic).

## Refactoring
- [ ] Split `supabase-page-repository.ts` into multiple files (Entity per file).
- [ ] Consolidate duplicate CSS tokens in `globals.css`.
