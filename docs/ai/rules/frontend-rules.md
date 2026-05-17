# Frontend Rules

## 1. Next.js 15 (App Router)
- Use Server Components por padrão.
- Use Client Components apenas quando necessário (interatividade, hooks).
- Mantenha a hierarquia de pastas organizada por rota.

## 2. Componentes (shadcn/ui)
- Use os componentes da pasta `src/components/ui` como base.
- Siga o padrão de composição do Radix UI.
- Estilização via Tailwind CSS 4.

## 3. Hooks
- Centralize lógica de fetch em hooks customizados (ex: `useBusiness`).
- Use `useMemo` e `useCallback` para otimizar componentes caros se necessário.

## 4. Forms
- Use `react-hook-form` com `zod` para validação.
- Mantenha esquemas de validação em `src/lib/validations`.

## 5. Visual Identity
- Siga os tokens de design definidos em `globals.css` (primary: purple).
- Garanta suporte total a Dark Mode.
