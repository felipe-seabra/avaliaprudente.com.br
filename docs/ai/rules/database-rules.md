# Database Rules

## 1. Migrations
- Todas as alterações no esquema devem ser feitas via migrações do Supabase em `supabase/migrations`.
- Nomeie migrações com timestamp e descrição clara.
- Nunca altere migrações já aplicadas em produção.

## 2. Row Level Security (RLS)
- **MANDATÓRIO:** Toda nova tabela deve ter RLS habilitado.
- Defina políticas claras para `SELECT`, `INSERT`, `UPDATE` e `DELETE`.
- Teste políticas com usuários autenticados e anônimos.

## 3. Naming Conventions
- Tabelas e colunas em `snake_case`.
- Nomes de tabelas no plural (ex: `businesses`, `reviews`).
- Use IDs UUID para chaves primárias.

## 4. Performance
- Adicione índices para colunas usadas frequentemente em filtros (`WHERE`) e joins.
- Use chaves estrangeiras (`FK`) para manter integridade referencial.
