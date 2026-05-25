# Security Guardrails — Avalia Prudente

Lista de verificação rápida para desenvolvedores e agentes de IA.

## ✅ O QUE FAZER (DO)
- **RLS:** Sempre use `is_admin()` em políticas para evitar recursão.
- **Consultas Públicas:** Sempre adicione `.eq('is_frozen', false)`.
- **Inputs:** Valide tudo com Zod antes de qualquer processamento.
- **Sudo:** Use o hook de sudo para qualquer ação que altere o status da conta ou faturamento.
- **Logs:** Use severidades estruturadas (ex: `logger.security(...)`).
- **Cache:** Use clientes anônimos para alimentar dados em Server Components cacheados.
- **Webhooks:** Verifique sempre o `signature-header`.

## ❌ O QUE NÃO FAZER (DON'T)
- **Secrets:** NUNCA exponha `service_role` no cliente.
- **Privacy:** NUNCA salve IP ou User-Agent em texto puro no banco de dados.
- **Cache:** NUNCA chame `cookies()` ou `headers()` dentro de `unstable_cache`.
- **Auth:** NUNCA confie em IDs de usuário vindos do payload do cliente sem validar no servidor.
- **CSP:** NUNCA habilite `unsafe-eval`.
- **Database:** NUNCA execute comandos destrutivos sem o prefixo `npm run`.
- **PII:** NUNCA logue dados pessoais (email, nome, CPF, etc) em logs de aplicação.
