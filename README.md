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
- **Gestão Multi-empresa:** Gerencie múltiplos locais em um único painel.
- **Painel Administrativo (RBAC):** Interface completa para moderação de empresas, usuários e solicitações de verificação.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Backend/Auth:** Supabase (SSR)
- **Design System:** OKLCH Colors + Modern SaaS Identity

## Arquitetura (Clean Architecture)

- `src/core/domain`: Entidades e regras de negócio puras.
- `src/core/application`: Casos de uso.
- `src/core/infrastructure`: Repositórios Supabase e implementações técnicas.
- `src/components`: UI (shadcn), Shared, Marketing, Dashboard e Admin.
- `src/middleware.ts`: Roteamento e orquestração centralizada de autenticação, proteção contra acesso não autorizado (banned/suspended/deleted), e bypass seguro para administradores.

## Desenvolvimento Local

Consulte [docs/LOCAL_SUPABASE.md](docs/LOCAL_SUPABASE.md) para configurar o ambiente Docker.

```bash
npm install
npm run supabase:start
npm run dev
```

### Manutenção do Docker
Se o Docker estiver consumindo muito espaço em disco, utilize os comandos de manutenção:
- `npm run docker:audit`: Analisa o uso de disco.
- `npm run docker:clean`: Limpeza segura de recursos não utilizados.

Para um guia completo, veja [docs/DOCKER_MAINTENANCE.md](docs/DOCKER_MAINTENANCE.md).

