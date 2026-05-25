# Architecture Rules — Avalia Prudente

## 1. Clean Architecture (Strict)
- Camadas: `Domain` -> `Application` -> `Infrastructure` -> `UI`.
- **Domain:** Apenas lógica pura e interfaces. Zero dependência de frameworks.
- **Application:** Use cases e serviços (ex: `BillingService`).
- **Infrastructure:** Implementações Supabase, Redis, APIs externas.
- **UI:** Server/Client Components, Hooks e Actions.

## 2. SSR & Cache Isolation
- **Cache Boundary:** Use `unstable_cache` para dados públicos.
- **Isolation:** Proibido usar `cookies()` ou `headers()` dentro de funções cacheadas. Isso evita o vazamento de dados de sessão de um usuário para o cache público.
- **Anonymous Clients:** Alimente o cache público usando clientes Supabase anônimos.

## 3. Server Actions & Security
- **Trust Boundaries:** Server Actions devem re-validar a autorização do usuário usando Supabase SSR no servidor. Nunca confie em parâmetros de ID passados pelo cliente sem validação de posse (`owner_id`).
- **Input Validation:** Validação mandatória com Zod para todos os payloads.

## 4. Multi-tenancy
- **Single Source of Truth:** O `business_id` deve ser derivado do contexto do usuário ou da rota, nunca apenas de um estado do cliente.
- **Schema Isolation:** RLS é a ferramenta primária de isolamento. Tabelas compartilhadas devem ter `owner_id`.

## 5. Observabilidade & Logs
- **Structured Logging:** Use logs com níveis de severidade (`info`, `warn`, `error`, `security`).
- **Correlation IDs:** Propague IDs de correlação entre middleware e serviços para rastreamento de requisições.
- **No PII:** Proibido logar dados pessoais identificáveis.
