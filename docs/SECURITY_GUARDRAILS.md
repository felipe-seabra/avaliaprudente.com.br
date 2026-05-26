# Security Guardrails — Avalia Prudente

Lista de verificação rápida para desenvolvedores e agentes de IA.

## ✅ O QUE FAZER (DO)
- **Branch Protection:** Trabalhe SEMPRE em branches de feature (`feat/...`).
- **Main Sync:** Mantenha a branch `main` local sempre idêntica à `origin/main`.
- **RLS:** Sempre use `is_admin()` em políticas para evitar recursão.
- **Consultas Públicas:** Sempre adicione `.eq('is_frozen', false)`.
- **Inputs:** Valide tudo com Zod antes de qualquer processamento.
- **Sudo:** Use o hook de sudo para qualquer ação que altere o status da conta ou faturamento.
- **Logs:** Use severidades estruturadas (ex: `logger.security(...)`).
- **Cache:** Use clientes anônimos para alimentar dados em Server Components cacheados.
- **Webhooks:** Verifique sempre o `signature-header`.

## ❌ O QUE NÃO FAZER (DON'T)
- **Main Branch:** NUNCA implemente ou commite diretamente na branch `main` local.
- **Secrets:** NUNCA exponha `service_role` no cliente.
- **Privacy:** NUNCA salve IP ou User-Agent em texto puro no banco de dados.
- **Cache:** NUNCA chame `cookies()` ou `headers()` dentro de `unstable_cache`.
- **Auth:** NUNCA confie em IDs de usuário vindos do payload do cliente sem validar no servidor.
- **CSP:** NUNCA habilite `unsafe-eval`.
- **Database:** NUNCA execute comandos destrutivos sem o prefixo `npm run`.
- **PII:** NUNCA logue dados pessoais (email, nome, CPF, etc) com logs de aplicação.

## 🔄 PROCEDIMENTO DE RECUPERAÇÃO DE WORKFLOW
Se commits forem criados acidentalmente na `main` local:
1. Crie branch de feature: `git checkout -b feat/recovery-branch`
2. Push da branch: `git push origin feat/recovery-branch`
3. Resetar `main` local: `git checkout main && git fetch origin && git reset --hard origin/main`
