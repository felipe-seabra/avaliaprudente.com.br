# System Map: Avalia Prudente

## Estrutura de Diretórios

### `/src`
- **`/app`**: Rotas da aplicação Next.js.
  - `/(auth)`: Login, Registro, Recuperação de senha.
  - `/admin`: Painel de administração (Verificações, Usuários, Empresas).
  - `/dashboard`: Painel do cliente (Analytics, Editor de Página, Links, QR Codes).
  - `/r/[slug]`: Fluxo público de avaliação.
  - `/[slug]`: Página pública da empresa (NFC/Link Tree).
- **`/components`**: Componentes reutilizáveis.
  - `/admin`: UI específica do administrador.
  - `/dashboard`: Sidebar, Nav, Modais de criação.
  - `/marketing`: Seções da Landing Page.
  - `/shared`: Componentes transversais (ReviewFlow, ImageUpload).
  - `/ui`: Componentes base do shadcn/ui.
- **`/core`**: Lógica de negócio.
  - `/domain`: Entidades (`Business`, `Review`, `User`).
  - `/infrastructure`: Repositórios Supabase (`supabase-business-repository.ts`, etc).
- **`/hooks`**: Hooks para abstração de dados (`useBusiness`, `useBusinessPage`).
- **`/lib`**: Utilitários, constantes e configuração do cliente Supabase.
- **`/providers`**: Contextos globais (Tema, BusinessContext).

### `/supabase`
- **`/migrations`**: Histórico completo do esquema do banco de dados.
- **`seed.sql`**: Dados iniciais para desenvolvimento local.

## Fluxos Principais
1. **Onboarding:** Registro -> Login -> Criar Empresa.
2. **Configuração:** Editor de Página -> Adicionar Links -> Gerar QR Code.
3. **Uso Público:** Cliente escaneia QR -> Abre `/[slug]` ou `/r/[slug]` -> Avalia.
4. **Verificação:** Dashboard -> Solicitar Selo -> Admin aprova em `/admin/verifications`.
