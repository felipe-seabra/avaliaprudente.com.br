# Security Architecture — Avalia Prudente

Este documento descreve os pilares de segurança da plataforma **Avalia Prudente**, servindo como fonte da verdade para governança técnica e auditorias.

## 1. Modelo de Confiança (Trust Model)
A plataforma opera sob um modelo de **Confiança Zero no Cliente**.
- **Autenticação:** Gerenciada via Supabase SSR.
- **Autorização:** Executada em duas camadas:
    1. **Middleware:** Bloqueios de moderação, roteamento protegido e rate limiting.
    2. **Database (RLS):** Garantia final de isolamento multi-tenant.

## 2. Camadas de Defesa

### A. Rate Limiting Distribuído
- **Tecnologia:** Upstash Redis + Next.js Middleware.
- **Escopo:** Proteção contra ataques de força bruta em rotas de Auth e abuso de submissão em rotas de Reviews.

### B. Isolamento Multi-tenant (RLS)
- **Mecanismo:** Políticas de Row Level Security baseadas em `auth.uid()`.
- **Prevenção de Recursão:** Uso de funções `security definer` para evitar queries circulares a `profiles`.
- **Public Sandbox:** Empresas marcadas como `is_frozen = true` são automaticamente ocultadas de todas as queries que não possuam privilégios de `admin`.

### C. Privileged Operations (Sudo Mode)
- **Conceito:** Ações de alto impacto exigem que o usuário tenha se reautenticado nos últimos 5-15 minutos.
- **Provider-Aware:** O sistema rastreia o provedor OAuth original para garantir que a reautenticação seja consistente (ex: re-login com Google).

### D. Isolamento de Cache SSR
- **Estratégia:** Separação estrita entre cache público e privado.
- **Safety Rule:** Funções cacheadas via `unstable_cache` não têm acesso a contextos de sessão (cookies/headers).

## 3. Privacidade & LGPD por Design
- **Fingerprinting:** Geração de identificadores anônimos baseados em dados do cliente (sem IP/UA) para prevenção de fraude sem violar a privacidade.
- **Minimização de Dados:** Persistência de dados PII limitada ao mínimo necessário para operação e conformidade legal.
- **Data Disposal:** Ciclo de vida de exclusão (soft-delete) com purga física programada.

## 4. Faturamento e Limites (Billing Trust Boundaries)
- **Boundary:** Toda validação de cota e plano ocorre no servidor via `BillingService`.
- **Webhook Integrity:** Verificação obrigatória de assinaturas de provedores de pagamento.

## 5. Observabilidade de Segurança
- **Logs de Auditoria:** Rastreamento de ações administrativas e alterações de permissões.
- **Monitoramento de Anomalias:** Alertas baseados em picos de erro 403/401 ou violações repetitivas de RLS.

## 6. Governança de Código
- **Review Mandatório:** Mudanças em `middleware.ts`, migrações de DB e `BillingService` exigem revisão sênior.
- **Automated Scanning:** Uso de `npm run lint` para detectar padrões de segurança inseguros.
