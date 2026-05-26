# Security Guardrails — Avalia Prudente

Lista de verificação rápida para desenvolvedores e agentes de IA.

## ✅ O QUE FAZER (DO)
- **Branch Protection:** Trabalhe SEMPRE em branches de feature (`feat/...`).
- **Main Sync:** Mantenha a branch `main` local sempre idêntica à `origin/main`.
- **RLS:** Sempre use `is_admin()` em políticas para evitar recursão.
- **Consultas Públicas:** Sempre adicione `.eq('is_frozen', false)`.
- **Entitlements:** Use SEMPRE os helpers centralizados (`canUseFeature`, `getQuota`) no servidor.
- **Quotas:** Valide as cotas do plano ANTES de qualquer mutação de criação (ex: novo business).
- **Super Admin Bypass:** Certifique-se de que o bypass de super_admin esteja centralizado no resolver de entitlements.
- **Audit Logs:** Registre todas as mudanças de plano e status de assinatura em `subscription_audit_logs`.
- **Inputs:** Valide tudo com Zod antes de qualquer processamento.
- **Sudo:** Use o hook de sudo para qualquer ação que altere o status da conta ou faturamento.
- **Logs:** Use severidades estruturadas (ex: `logger.security(...)`).
- **Cache:** Use clientes anônimos para alimentar dados em Server Components cacheados.
- **Webhooks:** Verifique sempre o `signature-header`.

## ❌ O QUE NÃO FAZER (DON'T)
- **Main Branch:** NUNCA implemente ou commite diretamente na branch `main` local.
- **Secrets:** NUNCA exponha `service_role` no cliente.
- **Privacy:** NUNCA salve IP ou User-Agent em texto puro no banco de dados.
- **Auth:** NUNCA confie em IDs de usuário vindos do payload do cliente sem validar no servidor.
- **Entitlements:** NUNCA faça verificações de plano codificadas (ex: `if (plan === 'pro')`). Verifique sempre a FEATURE ou COTA.
- **Billing:** NUNCA trate o provedor de pagamento (Stripe/Paddle) como a fonte da verdade para autorização.
- **Client Trust:** NUNCA confie em validações de cota feitas apenas no cliente.
- **Cache:** NUNCA chame `cookies()` ou `headers()` dentro de `unstable_cache`.
- **CSP:** NUNCA habilite `unsafe-eval`.
- **Database:** NUNCA execute comandos destrutivos sem o prefixo `npm run`.
- **PII:** NUNCA logue dados pessoais (email, nome, CPF, etc) com logs de aplicação.

## 🔄 PROCEDIMENTO DE RECUPERAÇÃO DE WORKFLOW
Se commits forem criados acidentalmente na `main` local:
1. Crie branch de feature: `git checkout -b feat/recovery-branch`
2. Push da branch: `git push origin feat/recovery-branch`
3. Resetar `main` local: `git checkout main && git fetch origin && git reset --hard origin/main`
