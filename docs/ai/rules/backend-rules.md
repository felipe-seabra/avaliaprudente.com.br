# Backend Rules

## 1. Supabase First
- Utilize as funcionalidades nativas do Supabase (Auth, RLS, Storage).
- Prefira lógica no banco de dados (Triggers, Functions) para integridade referencial complexa.

## 2. Repositories
- Toda comunicação com o Supabase deve passar por uma classe de repositório em `src/core/infrastructure/repositories`.
- Repositórios devem retornar entidades do domínio ou DTOs definidos.

## 3. Error Handling
- Use o utilitário `parseError` em `src/lib/error-handler.ts`.
- Nunca exponha erros brutos do banco de dados para o usuário final.
- Logue erros no servidor/middleware para depuração.

## 4. Multi-tenancy
- Toda consulta que envolva dados sensíveis de empresas DEVE incluir o filtro de `owner_id` ou ser protegida por RLS.
- Nunca confie apenas no ID enviado pelo cliente; valide o proprietário no servidor/DB.
