# Security Rules

## 1. Autenticação, Autorização e Moderação
- Valide sessões no `src/middleware.ts` e em Server Components.
- Verifique roles (`admin`, `customer`) antes de permitir acesso a rotas sensíveis.
- **Moderação Obrigatória:** O `middleware.ts` deve SEMPRE verificar e redirecionar usuários bloqueados (`is_deleted`, `account_status = 'banned'`, `suspended_until`).
- **Admin Bypass:** Usuários com a role `admin` devem contornar restrições de moderação para garantir que nunca percam acesso à plataforma.
- **Soft Delete:** Nunca delete registros da tabela `profiles`. Use `is_deleted = true` e mantenha a integridade referencial.

## 2. Proteção de Dados (LGPD)
- Respeite as preferências de cookies.
- Garanta que o usuário possa solicitar a exclusão de seus dados.
- Não logue dados sensíveis (PII) ou credenciais.

## 3. Variáveis de Ambiente
- Nunca comite o arquivo `.env`.
- Use `src/lib/env.ts` para validar variáveis obrigatórias.

## 4. Rate Limiting
- Mantenha e melhore o sistema de rate limiting no Middleware para evitar abusos em rotas públicas.

## 5. Input Sanitization
- Sempre valide inputs via Zod para prevenir ataques de injeção.
- O Supabase já trata SQL Injection, mas a validação de domínio é necessária.
