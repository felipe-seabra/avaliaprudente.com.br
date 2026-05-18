# GPT.md — Avalia Prudente: Portable Project Intelligence & Primary Memory

Este documento é a camada de inteligência primária e memória de longo prazo do projeto. Ele consolida toda a arquitetura atual, lições aprendidas em estabilização e regras críticas para garantir a continuidade entre diferentes sessões de IA.

> **Regras Universais:** Todas as interações devem respeitar `docs/ai/shared-context.md`.

## 1. Arquitetura Atual & Tech Stack
- **Framework:** Next.js 15 (App Router) - Uso intensivo de Server Components e Server Actions.
- **Database/Auth:** Supabase (PostgreSQL) com SSR.
- **Estilização:** Tailwind CSS 4 + shadcn/ui (OKLCH Colors).
- **Clean Architecture:** Camadas estritas: `Domain` (Entidades/Interfaces) -> `Application` (Use Cases) -> `Infrastructure` (Repositórios/Supabase) -> `UI` (Components/Hooks).
- **Workflow Docker:** `npm run supabase:start` para ambiente local. Use `scripts/docker-maintenance.sh` para auditoria e limpeza de disco.

## 2. Sistema de Moderação (Moderation Lifecycle)
O motor de moderação é centralizado e progressivo:
- **Advertências (Warnings):** Registradas em `moderation_actions`. 2+ advertências disparam sugestão de suspensão.
- **Suspensão (Temporary):** Bloqueia acesso ao dashboard por 3-90 dias (`suspended_until`).
- **Banimento (Permanent):** Bloqueio definitivo via `account_status = 'banned'`.
- **Desativação (Soft Delete):** `is_deleted = true` em `profiles`. Nunca delete registros de perfis para manter integridade referencial.
- **Congelamento de Empresa (Frozen Business):** `is_frozen = true` em `businesses`. Remove a empresa da visibilidade pública, desativa slugs personalizados e links de avaliação, independentemente do status do dono.
- **Audit Flow:** Todas as ações administrativas devem gerar um registro em `moderation_actions`.

## 3. Estabilização de Admin & Auth (Lições Críticas)
- **Admin Master Bypass:** Administradores (`role = 'admin'`) DEVEM contornar todas as restrições de moderação. Isso é garantido no `middleware.ts` e na função de banco de dados `is_admin()`.
- **Middleware Sensitivity:** O `src/middleware.ts` é o coração da segurança. Ele valida sessões, detecta usuários bloqueados e gerencia o bypass de admin. Evite refatorações amplas aqui sem testes exaustivos.
- **Hydration & Redirect Loops:** Erros de "admin redirect loop" foram resolvidos usando `AdminGuard` no lado do cliente e verificações de role no lado do servidor (RSC) ANTES da hidratação.
- **JWT vs Database:** O middleware depende do `updateSession` para obter o estado atualizado do banco de dados (suspensão/banimento), pois o JWT do Supabase pode estar desatualizado.

## 4. Prevenção de Regressões (Regressions History)
- **RLS Recursion:** NUNCA faça queries diretas a `profiles` dentro de políticas RLS. Isso causa loop infinito (Erro 500). Use SEMPRE a função `SECURITY DEFINER` `is_admin()`.
- **Schema Mismatch:** Sempre sincronize migrações locais com o ambiente remoto. O middleware falhará se colunas como `suspended_until` ou `is_deleted` não existirem no banco.
- **Public Visibility:** Falhas anteriores permitiram que empresas congeladas fossem acessadas via slugs. Agora, repositórios públicos (`BusinessPageRepository`, `ReviewLinkRepository`) VALIDAM `is_frozen` explicitamente.

## 5. Regras para Desenvolvimento Futuro
- **Incrementalismo:** Estabilize o núcleo antes de expandir. Verifique sempre o impacto no Admin.
- **Validação Obrigatória:** `npm run lint` && `npm run build` após QUALQUER mudança.
- **Admin Dashboard Test:** Qualquer alteração em Auth ou Middleware exige teste manual de login como Admin.
- **Non-Recursive RLS:** Verifique se novas políticas RLS não introduzem recursão.
- **Schema Discipline:** Migrações devem ser testadas com `supabase db reset` localmente antes de subir.

## 6. Guia Operacional
- **Troubleshooting Auth:** Verifique os logs do Middleware no console. Eles indicam o fluxo de redirecionamento (User ID, Role, Status).
- **Safe Reset:** `npm run supabase:stop && npm run supabase:start` limpa o estado local se o banco ficar inconsistente.
- **Debug Moderation:** Teste o comportamento de bloqueio usando o painel Admin para suspender/banir contas de teste.
