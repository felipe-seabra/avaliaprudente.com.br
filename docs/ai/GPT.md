# GPT.md — Avalia Prudente: AI Architectural Memory & Intelligence

Este documento consolida a arquitetura endurecida e as lições aprendidas do projeto **Avalia Prudente**. Ele serve como a memória de longo prazo para garantir que qualquer IA (ChatGPT, Claude, Gemini) mantenha a integridade do sistema.

> **Regras Universais:** Todas as interações DEVEM respeitar `docs/ai/shared-context.md`.

## 1. Arquitetura de Segurança Endurecida
- **Auth Boundary:** Supabase SSR com validação rigorosa no `middleware.ts`.
- **Sudo Mode:** Operações críticas (billing, deletes, roles) exigem reautenticação OAuth-aware.
- **Isolamento de Cache:** O cache SSR (`unstable_cache`) é estritamente isolado de cookies/headers para evitar vazamento de dados privados.
- **Rate Limiting:** Sistema distribuído via Upstash Redis protegendo rotas sensíveis.
- **Privacidade LGPD:** Fingerprinting anônimo SHA-256 para controle de abuso; proibido persistir IPs ou User-Agents crus.

## 2. Sistemas Core & Inteligência
- **Moderation Engine:** Ciclo progressivo de Warnings -> Suspensions -> Bans. Admins possuem bypass total (`is_admin()`).
- **Bayesian Ranking:** Cálculo ponderado de visibilidade para empresas verificado e featured.
- **Anti-Spam:** Proteção de triggers no DB contra abuso de reviews e analytics deduplication (janela de 15 min).
- **Branding Isolation:** Carregamento dinâmico de logos e cores via Edge Runtime (`opengraph-image.tsx`).

## 3. Prevenção de Regressões Críticas
- **RLS Infinite Loop:** NUNCA consulte `profiles` dentro de políticas RLS. Use apenas funções `security definer`.
- **Tenant Leakage:** SEMPRE valide `owner_id` em mutações e aplique filtros de `is_frozen` em queries públicas.
- **Billing Boundary:** NUNCA confie no estado de faturamento do cliente; valide via `BillingService` no servidor.
- **Middleware Safety:** Qualquer mudança no `middleware.ts` deve ser validada contra loops de redirecionamento.

## 4. Guia de Implementação para IAs
- **Branch Protection (Hard Rule):** É terminantemente PROIBIDO commitar na branch `main` local. Crie sempre uma feature branch antes de iniciar qualquer implementação.
- **Incrementalismo:** Estabilize o núcleo de segurança antes de expandir funcionalidades.
- **Validação Total:** `npm run lint` && `npm run build` && `npm run test` são obrigatórios.
- **Admin Dashboard Check:** Alterações de Auth/Middleware exigem teste manual de login admin.
- **Logs Estruturados:** Use apenas logs estruturados (severidade, correlation ID) e evite logar PII.

## 5. Operação de Banco de Dados
- **Safety Guard:** Comandos destrutivos exigem execução via `npm run` para ativar `scripts/db-safety.sh`.
- **Branch-Based Migrations:** Gere e teste migrações apenas em feature branches. NUNCA a partir da `main`.
- **Migrações:** Use `npm run supabase:migration` para qualquer alteração de esquema.
- **RLS Audit:** Toda nova tabela deve obrigatoriamente ter políticas RLS definidas.
