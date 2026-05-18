# Local Supabase Development

Esta documentação descreve o processo de configuração e uso do Supabase localmente utilizando Docker.

## Pré-requisitos

- Docker Desktop instalado e rodando.
- Node.js e npm.

## Comandos Úteis

Os seguintes comandos estão disponíveis via `npm run`:

- `npm run supabase:start`: Inicia todos os serviços do Supabase via Docker.
- `npm run supabase:stop`: Para todos os serviços e remove os containers.
- `npm run supabase:status`: Verifica o status dos serviços e exibe as chaves/URLs.
- `npm run supabase:reset`: Reseta o banco de dados para o estado inicial (executa migrações e seed).
- `npm run supabase:migration <nome>`: Cria um novo arquivo de migração em `supabase/migrations`.

## URLs Locais

- **Supabase Studio:** [http://localhost:54323](http://localhost:54323) (Interface administrativa do banco e auth)
- **API URL:** [http://localhost:54321](http://localhost:54321)
- **Mailpit:** [http://localhost:54324](http://localhost:54324) (Para testar fluxos de email como confirmação de conta)

## Autenticação

O fluxo de autenticação local funciona exatamente como no Cloud. Ao disparar um email de confirmação ou recuperação de senha, ele será capturado pelo **Mailpit**. Você pode acessar a interface do Mailpit para clicar nos links de confirmação.

## Banco de Dados e Migrações

Todas as alterações no esquema do banco de dados devem ser feitas via migrações:

1. Crie uma migração: `npm run supabase:migration add_new_table`
2. Edite o arquivo gerado em `supabase/migrations`.
3. Aplique as mudanças: `npm run supabase:reset` ou apenas inicie o ambiente.

## Troubleshooting

- **Docker não está rodando:** Certifique-se de que o Docker Desktop está ativo antes de rodar `npm run supabase:start`.
- **Portas ocupadas:** O Supabase utiliza várias portas (54321-54330). Se houver conflito, verifique processos rodando nessas portas.
- **Containers não iniciam:** Tente rodar `npm run supabase:stop` seguido de `npm run supabase:start`.

## Manutenção e Limpeza (Docker)

O ambiente local do Supabase pode consumir uma quantidade significativa de espaço em disco ao longo do tempo. Se você estiver enfrentando falta de espaço ou quiser estabilizar o ambiente Docker, siga estas recomendações:

### Limpeza Preventiva

Para remover recursos não utilizados do Docker sem afetar os dados importantes:

```bash
# Remove containers parados e imagens pendentes (dangling)
docker system prune
```

### Limpeza Profunda (Deep Clean)

Se você não planeja usar o ambiente local por um tempo e quer recuperar o máximo de espaço:

1. Pare o Supabase: `npm run supabase:stop`
2. Remova todos os recursos não utilizados (incluindo imagens):
   ```bash
   docker system prune -a --volumes
   ```

**Aviso:** O comando acima removerá imagens e volumes. Os volumes do Supabase contêm os dados do seu banco de dados local. Use com cautela se tiver dados de teste importantes que não foram salvos via `seed.sql`.

### Quando usar o ambiente local?

Atualmente, o projeto está configurado para usar o **Supabase remoto** por padrão no arquivo `.env.local`. O ambiente Docker local é opcional e recomendado apenas para:
- Desenvolvimento offline.
- Testes de migrações complexas antes de aplicar no Cloud.
- Testes de fluxos de email via Mailpit.
