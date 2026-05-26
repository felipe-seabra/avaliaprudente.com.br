# Shared AI Context

Este arquivo contém as regras de governança universal, fluxos de trabalho compartilhados e padrões operacionais que se aplicam a TODOS os agentes de IA (Codex CLI, Aider, Gemini, etc.) e colaboradores humanos.

## 1. Regras Universais do Repositório
- **Agentes Primários:** Codex CLI (IDE/implementação) e Aider (refactoring/contexto amplo).
- **Linguagem:** Código, variáveis e commits DEVEM ser em Inglês. Respostas e explicações no terminal DEVEM ser em Português Brasileiro.
- **Stack:** Next.js 15 (App Router), Supabase (SSR), Tailwind CSS 4, shadcn/ui.
- **Arquitetura:** Clean Architecture (`Domain` -> `Application` -> `Infrastructure` -> `UI`).
- **Limites de Confiança:** NUNCA confie em dados de autorização vindos do cliente. Use apenas o contexto de autenticação do servidor via Supabase SSR.

## 2. Governança de Segurança (Mandatória)
- **Zero-Trust Client:** Proibido expor `service_role` ou chaves privadas no lado do cliente.
- **Sudo Mode:** Operações privilegiadas (mudança de billing, exclusão de conta, alteração de permissões) EXIGEM reautenticação consciente do provedor (OAuth-aware sudo mode).
- **Isolamento de Cache SSR:** NUNCA utilize `cookies()` ou `headers()` dentro de `unstable_cache`. O cache público deve ser alimentado apenas por clientes anônimos para evitar vazamento de dados entre usuários.
- **Rate Limiting Distribuído:** Implementado via Upstash Redis. Novas rotas sensíveis (Auth, Reviews, API) DEVEM registrar o rate limit.
- **Privacidade & LGPD:**
    - NUNCA persista endereços IP ou User-Agent em texto puro.
    - Use apenas **Anonymized Fingerprints** (SHA-256) para detecção de abuso.
    - Respeite o princípio da minimização de dados.
- **Billing Trust Boundary:** Toda lógica de faturamento deve passar exclusivamente pelo `BillingService`. Webhooks devem ter assinatura verificada antes de qualquer processamento.
- **CSP & Headers:** Proibido habilitar `unsafe-eval` em produção. Mudanças no CSP exigem revisão de segurança.

## 3. Fluxo de Trabalho Compartilhado (Ciclo de Vida Mandatório)
Toda tarefa deve seguir rigorosamente:
1. **Branch Isolation:** Nunca trabalhe diretamente na `main`. Use branches de feature/fix.
2. **Research & Strategy:** Use ferramentas de busca para mapear o impacto antes de codificar.
3. **Implement:** Mudanças cirúrgicas e idiomáticas.
4. **Validation Pipeline:**
    - `npm run lint` (estilo e segurança estática).
    - `npm run build` (integridade de tipos e SSR).
    - `npm run test` (validação comportamental).
5. **Documentation Sync:** Atualizar `CHANGELOG.md`, `docs/current-state/*` e arquivos de governança se houver mudança arquitetural.
6. **Commit:** Apenas após passar em TODA a validação.

## 4. Preservação Arquitetural & Regressão
- **RLS Safety:** Use apenas funções `security definer` como `is_admin()` para evitar recursão RLS (Error 500).
- **Public Visibility:** Filtre SEMPRE `is_frozen = true` em consultas públicas.
- **Anti-Spam:** Valide fingerprints e cooldowns no lado do servidor (Triggers/Edge Functions).
- **Observabilidade:** Use apenas logs estruturados. NUNCA logue segredos, tokens, cookies ou PII (Personally Identifiable Information).

## 5. Áreas Protegidas
Modificações nestas áreas exigem cautela extrema:
- `src/middleware.ts` e `src/lib/supabase/*` (Auth & Segurança).
- `supabase/migrations/*.sql` (Esquema & RLS).
- `src/core/application/services/billing-service.ts` (Faturamento).
- Lógica de privacidade e termos de uso.

## 6. Padrões de Commit
- Use **Conventional Commits** em Inglês.
- Mensagens curtas, assertivas e focadas no "porquê".
- Comite apenas arquivos relevantes para a tarefa.
