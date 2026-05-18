# Database Rules

## 1. Migrations & Infrastructure Safety
- Todas as alterações no esquema devem ser feitas via migrações do Supabase em `supabase/migrations`.
- Nomeie migrações com timestamp e descrição clara.
- Nunca altere migrações já aplicadas em produção.
- **SEGURANÇA CRÍTICA:** Nunca execute `supabase db reset` ou comandos destrutivos contra projetos remotos (`--linked`) sem confirmação explícita do ambiente.
- **WORKFLOW LOCAL:** Use sempre o ambiente Docker local para desenvolvimento e testes de migração.
- **VALIDAÇÃO:** Antes de subir uma migração, teste localmente com `npm run supabase:reset`.

## 2. Row Level Security (RLS)
- **MANDATÓRIO:** Toda nova tabela deve ter RLS habilitado.
- Defina políticas claras para `SELECT`, `INSERT`, `UPDATE` e `DELETE`.
- Teste políticas com usuários autenticados e anônimos.
- **CRÍTICO - RLS Recursion Avoidance:** NUNCA faça consultas diretas à tabela `profiles` de dentro das políticas RLS para verificar roles de admin. Isso causa loops infinitos (Erro 500). Use SEMPRE a função `SECURITY DEFINER` `is_admin()`.
- **CRÍTICO - Moderation Visibility:** Toda política de `SELECT` para tabelas acessíveis ao público (ex: `businesses`, `business_pages`, `reviews`) DEVE incluir a restrição `is_frozen = false` para esconder conteúdo moderado do público.

## 3. Naming Conventions
- Tabelas e colunas em `snake_case`.
- Nomes de tabelas no plural (ex: `businesses`, `reviews`).
- Use IDs UUID para chaves primárias.

## 4. Performance
- Adicione índices para colunas usadas frequentemente em filtros (`WHERE`) e joins.
- Use chaves estrangeiras (`FK`) para manter integridade referencial.
