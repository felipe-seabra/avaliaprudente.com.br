# Avalia Prudente

Sistema inteligente de aquisição de avaliações Google via QR Code e redirecionamento estratégico.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Backend/Auth:** Supabase
- **Icons:** Lucide React
- **Theme:** next-themes (Dark/Light mode)

## Architecture

O projeto segue os princípios da **Clean Architecture** para garantir escalabilidade e manutenibilidade:

- `src/core/domain`: Entidades e interfaces de contrato.
- `src/core/application`: Casos de uso e lógica de negócio.
- `src/core/infrastructure`: Implementações técnicas (clientes de API, Supabase, etc).
- `src/components/ui`: Componentes base (shadcn).
- `src/components/shared`: Componentes reutilizáveis entre páginas.
- `src/providers`: Provedores de contexto React.

## Getting Started

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env.local` baseado no `.env.example`
4. Inicie o servidor de desenvolvimento: `npm run dev`

## Project Rules

- **Strict Typing:** Uso obrigatório de TypeScript sem `any`.
- **Clean Code:** Seguir princípios SOLID, DRY, KISS.
- **Accessibility:** Componentes devem ser acessíveis (WAI-ARIA).
- **Mobile-first:** Design responsivo priorizando dispositivos móveis.
