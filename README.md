# Avalia Prudente

Plataforma NFC inteligente para negócios locais. Transforme seu balcão em uma central de conexões digitais.

## O Produto

O Avalia Prudente é uma solução baseada em NFC (Near Field Communication) que permite que empresas criem páginas públicas personalizadas acessíveis via aproximação ou QR Code.

### Principais Funcionalidades

- **Páginas de Negócio Personalizáveis:** Crie uma vitrine digital com sua marca, logo e descrição.
- **Sistema de CTAs Modular:** Adicione botões para WhatsApp, Instagram, Website, Portfólio e mais.
- **Filtro Inteligente de Avaliações Google:** Capture feedbacks internos para notas baixas e direcione notas altas direto para o Google.
- **Gestão Multi-empresa:** Gerencie múltiplos locais em um único painel.
- **Painel Administrativo (RBAC):** Estrutura preparada para gestão global da plataforma.

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

## Desenvolvimento Local

Consulte [docs/LOCAL_SUPABASE.md](docs/LOCAL_SUPABASE.md) para configurar o ambiente Docker.

```bash
npm install
npm run supabase:start
npm run dev
```
