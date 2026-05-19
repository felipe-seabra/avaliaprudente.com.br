# Avalia Prudente

Plataforma NFC inteligente para negócios locais. Transforme seu balcão em uma central de conexões digitais.

## O Produto

O Avalia Prudente é uma solução completa baseada em NFC (Near Field Communication) e QR Codes que permite que empresas criem páginas públicas personalizadas e gerenciem sua reputação online de forma inteligente.

### Principais Funcionalidades

- **Páginas de Negócio Dinâmicas:** Vitrine digital personalizada com branding (logo, cores), descrição e links sociais.
- **Sistema de CTAs Modular:** Botões configuráveis para WhatsApp, Instagram, Website, Portfólio e mais.
- **Filtro Inteligente de Avaliações (Google Review Gate):** Capture feedbacks internos para notas baixas e direcione notas altas automaticamente para o Google Business.
- **Rankings Inteligentes (Algoritmo Bayesiano):** Listagem automatizada baseada em score ponderado (volume + média + verificação), destacando empresas "Elite" e "Em Alta".
- **Sistema de Moderação Completo:** Gestão de infrações com Advertências, Suspensões, Banimentos e Congelamento de Empresas (`is_frozen`).
- **Central de Transparência e Recursos:** Painel para usuários visualizarem sanções e submeterem contestações (Appeals).
- **Workflow de Verificação Oficial:** Processo formal de solicitação e aprovação do "Selo Azul" de confiança.
- **Onboarding de Alta Qualidade:** Fluxo guiado para criação de empresas garantindo completude de dados e prevenção de spam.
- **OG Image System (Edge):** Geração dinâmica de imagens OpenGraph para compartilhamento social, otimizada para o Vercel Edge Runtime.
- **Gestão Multi-empresa:** Dashboard centralizado para gerenciar múltiplos estabelecimentos com isolamento total (Tenant Isolation).

## Tech Stack

- **Frontend:** Next.js 15 (App Router - React 19)
- **Backend/Auth:** Supabase (Auth, DB, Storage) com SSR
- **Database:** PostgreSQL com RLS Hardened (Row Level Security)
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix Primitives)
- **Testing:** Vitest + React Testing Library
- **Runtime:** Node.js + Vercel Edge Runtime (OG Images)

## Arquitetura (Clean Architecture)

O projeto segue padrões estritos de separação de responsabilidades:

- `src/core/domain`: Entidades puras e interfaces de repositórios (regras de negócio).
- `src/core/application`: Casos de uso e orquestração (ex: lógica de rankings, submissão de reviews).
- `src/core/infrastructure`: Implementações técnicas (Repositórios Supabase, Mappers).
- `src/components`: UI components organizados por domínio (Admin, Dashboard, Marketing, Shared).
- `src/middleware.ts`: Núcleo de segurança (Auth, Rate Limit, Moderation Blocks, Admin Bypass).

## Desenvolvimento Local

Consulte [docs/LOCAL_SUPABASE.md](docs/LOCAL_SUPABASE.md) para configurar o ambiente Docker.

### Comandos de Banco de Dados (Seguros)

Utilizamos o **Safety Guard** (`scripts/db-safety.sh`) para proteger ambientes remotos:

- `npm run supabase:start`: Inicia o ambiente local.
- `npm run supabase:reset`: Reseta o banco local (limpa dados e re-seeda). **Seguro.**
- `npm run db:push`: Envia migrações para a nuvem. **Exige confirmação.**

### Qualidade e Estabilidade
- `npm run lint`: Verificação de padrões e erros.
- `npm run test`: Suíte de testes unitários e integração.
- `npm run build`: Validação completa de tipos, compilação e SSR.

## Governança e Operações

1. **Segurança RLS:** Isolamento multi-tenant garantido por políticas não-recursivas (uso de `is_admin()`).
2. **Ciclo de Moderação:** Proteção da plataforma contra abusos, com bypass garantido para administradores master.
3. **Reserva de Slugs:** Sistema de proteção contra colisão de rotas e nomes reservados.
4. **Manutenção Docker:** `npm run docker:audit` e `npm run docker:clean` para gestão de recursos.

---

Para detalhes técnicos profundos, consulte a pasta `docs/`.

