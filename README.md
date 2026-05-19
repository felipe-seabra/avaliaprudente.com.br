# Avalia Prudente

Plataforma NFC inteligente para negócios locais. Transforme seu balcão em uma central de conexões digitais.

## O Produto

O Avalia Prudente é uma solução baseada em NFC (Near Field Communication) que permite que empresas criem páginas públicas personalizadas acessíveis via aproximação ou QR Code.

### Principais Funcionalidades

- **Páginas de Negócio Personalizáveis:** Crie uma vitrine digital com sua marca, logo e descrição.
- **Sistema de CTAs Modular:** Adicione botões para WhatsApp, Instagram, Website, Portfólio e mais.
- **Filtro Inteligente de Avaliações Google:** Capture feedbacks internos para notas baixas e direcione notas altas direto para o Google.
- **Sistema de Verificação Oficial (Selo Azul):** Workflow completo de solicitação e aprovação de selos de confiança para empresas.
- **Rankings Inteligentes:** Algoritmos Bayesianos para listar os melhores estabelecimentos da cidade ("Elite") e os mais acessados ("Em Alta").
- **Sistema de Moderação e Auditoria:** Motor completo para Advertências, Suspensões, Banimentos e Congelamento de Empresas.
- **Central de Transparência e Recursos:** Painel dedicado para usuários acompanharem seu status e contestarem ações de moderação.
- **Gestão Multi-empresa:** Gerencie múltiplos locais em um único painel.
- **Painel Administrativo (RBAC):** Interface completa para moderação de empresas, usuários e solicitações de verificação.
- **OG Image System:** Geração dinâmica de imagens para redes sociais (OpenGraph) otimizada para Edge.

## Tech Stack

- **Framework:** Next.js 15 (App Router - React 19)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Backend/Auth:** Supabase (SSR)
- **Database:** PostgreSQL (RLS Hardened)
- **Design System:** OKLCH Colors + Modern SaaS Identity
- **Testing:** Vitest + React Testing Library

## Arquitetura (Clean Architecture)

- `src/core/domain`: Entidades e regras de negócio puras.
- `src/core/application`: Casos de uso (Orquestração).
- `src/core/infrastructure`: Repositórios Supabase e implementações técnicas.
- `src/components`: UI (shadcn), Shared, Marketing, Dashboard e Admin.
- `src/middleware.ts`: Roteamento centralizado, Segurança (Rate Limit, Auth, Moderation) e Admin Master Bypass.

## Desenvolvimento Local

Consulte [docs/LOCAL_SUPABASE.md](docs/LOCAL_SUPABASE.md) para configurar o ambiente Docker.

### Comandos de Banco de Dados (Seguros)

Implementamos um **Safety Guard** (`scripts/db-safety.sh`) que protege contra resets acidentais em ambientes remotos. Utilize sempre os comandos via `npm run`:

- `npm run supabase:start`: Inicia o ambiente local.
- `npm run supabase:reset`: Reseta o banco local (Seguro, valida ambiente).
- `npm run db:push`: Envia migrações para o banco vinculado (Solicita confirmação).

### Manutenção do Docker e Ambiente
Se o Docker estiver consumindo muito espaço ou o ambiente estiver instável:
- `npm run docker:audit`: Analisa o uso de disco.
- `npm run docker:clean`: Limpeza segura de recursos não utilizados.
- `npm run docker:reset-supa`: Hard Reset do ambiente Supabase local.

### Qualidade e Testes
- `npm run lint`: Verificação de padrões e erros de código.
- `npm run test`: Execução da suíte de testes unitários e de integração.
- `npm run build`: Validação completa de compilação e SSR.

## Segurança e Operações

1. **Proteção de Dados:** Isolamento multi-tenant via RLS garantido por políticas não-recursivas.
2. **Estabilidade de Autenticação:** Middleware valida sessões em tempo real contra o banco de dados.
3. **Migrações Incrementais:** Fluxo rigoroso de validação local antes de push para produção.
4. **Reserva de Slugs:** Sistema de proteção contra colisão com rotas do sistema.

