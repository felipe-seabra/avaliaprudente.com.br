# Project Memory: Avalia Prudente

## Visão Geral
**Avalia Prudente** é uma plataforma SaaS voltada para a aquisição de avaliações no Google através de QR Codes inteligentes e redirecionamento estratégico. O projeto foca em estabelecimentos locais, oferecendo uma ponte entre o mundo físico (Tags NFC/QR Codes) e o digital (Páginas de Avaliação).

## Stack Tecnológica
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Gerenciamento de Estado:** React Context (BusinessProvider), Hooks customizados.
- **Validação:** Zod + React Hook Form.

## Arquitetura
O projeto segue uma estrutura inspirada em **Clean Architecture**, embora a camada de Application (Use Cases) ainda esteja em fase de adoção.
- **Domain (`src/core/domain`):** Entidades puras e regras de negócio.
- **Infrastructure (`src/core/infrastructure`):** Repositórios Supabase e integrações externas.
- **UI Layer (`src/app`, `src/components`):** Componentes React e páginas Next.js.

## Regras de Negócio Críticas
1. **Isolamento Multi-tenant:** Garantido via Row Level Security (RLS) no Supabase, baseado no `owner_id`.
2. **Sistema de Verificação:** Fluxo formal de solicitação de selo de confiança, moderado por admins.
3. **Ranking (Média Bayesiana):** Algoritmo que pondera volume de avaliações e nota média para evitar rankings injustos.
4. **Redirecionamento Inteligente:** Avaliações >= 4 são direcionadas ao Google; < 4 abrem formulário de feedback interno.

## Áreas Sensíveis
- **Middleware:** Gerencia proteção de rotas (Admin/Dashboard) e controle de usuários bloqueados.
- **RLS Policies:** Crucial para manter a privacidade dos dados entre diferentes empresas.
- **Processamento de Ranking:** Depende da integridade dos dados de `reviews` e `analytics_events`.
