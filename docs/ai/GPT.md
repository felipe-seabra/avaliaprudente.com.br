# GPT.md — Avalia Prudente: Portable Project Intelligence & Primary Memory

Este documento é a camada de inteligência primária e memória de longo prazo do projeto. Ele consolida toda a arquitetura atual, lições aprendidas em estabilização e regras críticas para garantir a continuidade entre diferentes sessões de IA.

> **Regras Universais:** Todas as interações devem respeitar `docs/ai/shared-context.md`.

## 1. Arquitetura Atual & Tech Stack
- **Framework:** Next.js 15 (App Router / React 19). Uso intensivo de Server Components e Server Actions.
- **Database/Auth:** Supabase (PostgreSQL) com SSR e políticas RLS rigorosas.
- **Estilização:** Tailwind CSS 4 + shadcn/ui (OKLCH Colors).
- **Clean Architecture:** Camadas estritas: `Domain` (Entidades/Interfaces) -> `Application` (Use Cases) -> `Infrastructure` (Repositórios/Supabase) -> `UI` (Components/Hooks).
- **Workflow Docker:** `npm run supabase:start` para ambiente local. Use `scripts/docker-maintenance.sh` para auditoria e limpeza de disco.
- **Segurança de DB:** Todos os comandos destrutivos são protegidos por `scripts/db-safety.sh`. Nunca ignore os avisos de "REMOTE" em logs.
- **Testing:** Vitest + React Testing Library. Foco em lógica de domínio, middleware e componentes críticos.

## 2. Sistemas Core & Inteligência
- **Moderation Lifecycle:** Motor progressivo com Advertências (Warnings), Suspensão (Temporary), Banimento (Permanent), Desativação (Soft Delete) e Congelamento de Empresa (Frozen Business).
- **Transparency Center:** Localizado em `/dashboard/moderation`, permite visualização de status e submissão de **Appeals (Contestações)** via `moderation_appeals`.
- **Ranking System (Bayesian Average):** Localizado em `src/core/application/use-cases/get-public-rankings.ts`. Calcula o score ponderado baseado em volume de avaliações e média. Empresas **Verificadas** e **Featured** recebem multiplicadores de visibilidade.
- **Onboarding de Qualidade:** Fluxo rigoroso que exige dados completos da empresa antes da ativação pública. Protegido contra spam e duplicidade de slugs.
- **OG Image System:** Localizado em `src/app/opengraph-image.tsx`. Utiliza `next/og` no Edge Runtime. Layouts dinâmicos baseados no branding da empresa (logo/cores).
- **Slug Validation:** Proteção de unicidade via RPC `is_slug_available`. Slugs são normalizados e nomes de rotas do sistema são reservados.

## 3. Estabilização de Admin & Auth (Lições Críticas)
- **Admin Master Bypass:** Administradores (`role = 'admin'`) DEVEM contornar todas as restrições de moderação. Isso é garantido no `middleware.ts` e na função de banco de dados `is_admin()`.
- **Middleware Sensitivity:** O `src/middleware.ts` gerencia Rate Limiting, Session Refresh, Bloqueios de Moderação, Re-aceite de Termos e Redirecionamentos de Onboarding.
- **Auth Stability:** Sessões são validadas em tempo real. Erros de "JWT expired" ou "Profile not found" são tratados via redirecionamento seguro para logout ou re-onboarding.

## 4. Prevenção de Regressões (Regressions History)
- **RLS Recursion:** NUNCA faça queries diretas a `profiles` dentro de políticas RLS. Use SEMPRE a função `SECURITY DEFINER` `is_admin()`. Falha nisso causa erro 500 infinito.
- **Public Visibility:** Repositórios públicos DEVEM validar `is_frozen = false` explicitamente para evitar vazamento de dados de empresas suspensas.
- **Review-Link UX:** O link de avaliação (`/r/[slug]`) deve carregar o branding da empresa de forma rápida e segura, tratando estados de erro (empresa não encontrada ou congelada) com elegância.

## 5. Regras para Desenvolvimento Futuro
- **Incrementalismo:** Estabilize o núcleo antes de expandir. Verifique sempre o impacto no Admin.
- **Validação Obrigatória:** `npm run lint` && `npm run build` && `npm run test` após QUALQUER mudança.
- **Admin Dashboard Test:** Qualquer alteração em Auth ou Middleware exige teste manual de login como Admin.
- **Commit Discipline:** Use Conventional Commits em inglês. Mensagens curtas e assertivas.

## 6. Guia Operacional
- **Safe Reset:** `npm run supabase:reset` limpa o estado local de forma segura.
- **Docker Maintenance:** `npm run docker:audit` e `npm run docker:clean` para evitar estouro de disco.
- **Production Guard:** Nunca rode comandos `supabase db push` ou `reset` sem ler os avisos do Safety Guard.
