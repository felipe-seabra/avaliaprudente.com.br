# Protected Areas

Estas são as áreas mais sensíveis do projeto **Avalia Prudente**. Qualquer alteração nestes módulos exige cautela extrema e validação rigorosa.

## 1. Authentication & Session Handling
- **Arquivos:** `src/middleware.ts`, `src/lib/supabase/middleware.ts`, `src/app/auth/callback/route.ts`.
- **Dependências:** `@supabase/ssr`, `Next.js Middleware`.
- **Riscos de Regressão:** Loops de redirecionamento, perda de sessão em produção, acesso não autorizado a rotas de admin.
- **Checklist de Validação:**
  - [ ] Testar login e logout completo.
  - [ ] Validar redirecionamento de usuário bloqueado.
  - [ ] Validar que rotas `/admin` estão inacessíveis para usuários `customer`.
  - [ ] Verificar persistência da sessão após refresh.

## 2. Row Level Security (RLS) Policies
- **Arquivos:** `supabase/migrations/*.sql`.
- **Riscos de Regressão:** Vazamento de dados entre tenants (empresas), falha na exibição de páginas públicas, erro de permissão ao criar entidades.
- **Checklist de Validação:**
  - [ ] Testar acesso anônimo à página pública (`/[slug]`).
  - [ ] Tentar acessar dados de uma empresa B logado na empresa A.
  - [ ] Validar que apenas admins podem modificar solicitações de verificação.

## 3. Multi-tenant Logic
- **Arquivos:** `src/providers/business-provider.tsx`, `src/core/infrastructure/repositories/*.ts`.
- **Dependências:** `owner_id` em todas as tabelas principais.
- **Riscos de Regressão:** Exibição de dados da empresa errada no dashboard, salvamento de dados no tenant incorreto.
- **Checklist de Validação:**
  - [ ] Trocar de empresa no `BusinessSwitcher` e validar atualização de todos os componentes.
  - [ ] Validar que o `business_id` é propagado corretamente em novos links e reviews.

## 4. Verification System
- **Arquivos:** `src/app/admin/verifications/page.tsx`, `supabase/migrations/20260517150000_core_verification_schema.sql`.
- **Riscos de Regressão:** Quebra do selo de confiança, falha no ranking bayesiano.
- **Checklist de Validação:**
  - [ ] Criar solicitação como usuário.
  - [ ] Aprovar/Rejeitar como admin e verificar mudança de status no banco e na UI.

## 5. LGPD & Privacy
- **Arquivos:** `src/app/privacy/page.tsx`, `src/components/shared/cookie-consent.tsx`.
- **Checklist de Validação:**
  - [ ] Banner de cookies deve aparecer para novos usuários.
  - [ ] Links de políticas devem estar sempre visíveis no footer.
