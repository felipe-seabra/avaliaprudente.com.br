# ADR 001: Multi-tenant Strategy

## Contexto
A plataforma atende múltiplas empresas (tenants). É crucial garantir que os dados de uma empresa nunca vazem para outra e que o desenvolvimento de novas funcionalidades não exija filtros manuais constantes de tenant no código da aplicação.

## Decisão
Adotamos o isolamento via **Row Level Security (RLS)** do PostgreSQL/Supabase.
- Cada tabela sensível possui uma coluna `owner_id` vinculada ao UUID do usuário no Supabase Auth.
- Políticas RLS garantem que `auth.uid() = owner_id` para operações de escrita e leitura privada.

## Consequências
- **Positivas:** Segurança garantida na camada de banco de dados; código da aplicação mais limpo (o banco filtra os dados automaticamente).
- **Negativas:** Maior complexidade nas migrações SQL; risco de recursão infinita em políticas complexas; necessidade de auditoria rigorosa das políticas.

## Tradeoffs
Preferimos a complexidade inicial do RLS em vez do risco de erro humano ao esquecer um `.where('owner_id', user.id)` em consultas no backend.
