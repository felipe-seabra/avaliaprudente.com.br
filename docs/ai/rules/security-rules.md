# Security Rules — Avalia Prudente

## 1. Autenticação & Sudo Mode
- **Auth Local:** Use apenas Supabase SSR. Evite gerenciar tokens manualmente.
- **Sudo Mode:** Operações críticas (excluir conta, alterar billing, mudar permissões) DEVEM exigir `sudo mode` (reautenticação).
- **OAuth-Aware:** O sistema de sudo deve ser compatível com provedores OAuth.

## 2. Row Level Security (RLS) & Multi-tenancy
- **Tenant Isolation:** Cada query deve garantir que `owner_id` ou `business_id` pertença ao usuário autenticado.
- **RLS Recursion:** NUNCA faça queries a `profiles` dentro de políticas RLS. Use funções security definer como `is_admin()`.
- **Public Filtering:** SEMPRE filtre `is_frozen = true` em consultas públicas.

## 3. Privacidade & LGPD (Hardened)
- **Anonymization:** Proibido persistir IPs ou User-Agents em texto puro. Use apenas fingerprints SHA-256 anônimos.
- **Data Minimization:** Colete apenas o necessário. Remova dados de reviews excluídos permanentemente após 30 dias (soft-delete first).
- **Audit Logs:** Logs de auditoria devem ser estruturados e não conter PII.

## 4. Rate Limiting & Anti-Abuse
- **Distributed Rate Limit:** Novas rotas de API/Auth devem usar o middleware com Upstash Redis.
- **Abuse Protection:** Reviews possuem cooldowns por IP/User no banco de dados.

## 5. Billing Boundaries
- **Server-Only Logic:** Toda mutação de faturamento deve ocorrer no `BillingService` no servidor.
- **Webhook Trust:** Assinaturas de webhooks (Stripe/outros) devem ser verificadas antes do processamento.

## 6. CSP & Security Headers
- **No Unsafe-Eval:** Proibido habilitar `unsafe-eval`.
- **Minimal Inline:** Minimize o uso de scripts inline.
- **Trusted Sources:** Adicione novos domínios externos apenas após revisão de segurança.
