# ADR 002: Authentication Strategy

## Contexto
Precisamos de um sistema de autenticação robusto que funcione tanto em Server Components quanto em Client Components, suportando SSR e proteção de rotas no Middleware.

## Decisão
Utilizamos o **Supabase Auth** com o pacote `@supabase/ssr`.
- Gerenciamento de tokens via Cookies (em vez de LocalStorage) para suporte a SSR.
- Middleware Next.js para atualizar sessões e proteger rotas antes da renderização.

## Consequências
- **Positivas:** Integração nativa com RLS; suporte total a Server Components do Next.js 15.
- **Negativas:** Dependência de Cookies exige configuração cuidadosa para evitar problemas de domínios cruzados; Middleware torna-se um ponto único de falha.

## Tradeoffs
A facilidade de integração com o ecossistema Supabase superou a necessidade de uma solução agnóstica como Auth.js (NextAuth).
