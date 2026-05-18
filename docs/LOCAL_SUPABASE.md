# Local Supabase Development

Esta documentação descreve o processo de configuração e uso do Supabase localmente utilizando Docker.

## Pré-requisitos

- Docker Desktop instalado e rodando.
- Node.js e npm.

## Comandos Úteis

Os seguintes comandos estão disponíveis via `npm run` e são protegidos pelo **Database Safety Guard** (`scripts/db-safety.sh`), que impede a execução acidental em ambientes de produção:

- `npm run supabase:start`: Inicia todos os serviços do Supabase via Docker.
- `npm run supabase:stop`: Para todos os serviços e remove os containers.
- `npm run supabase:status`: Verifica o status dos serviços e exibe as chaves/URLs.
- `npm run supabase:reset`: Reseta o banco de dados local (executa migrações e seed). **Aviso:** Valida se o ambiente é local antes de prosseguir.
- `npm run db:push`: Envia migrações para um projeto vinculado (Cloud). **Aviso:** Exige confirmação explícita escrevendo "remoto".
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

Implementamos ferramentas para automatizar a manutenção do ambiente Docker. Para mais detalhes, consulte [docs/DOCKER_MAINTENANCE.md](DOCKER_MAINTENANCE.md).

### Comandos de Manutenção

- `npm run docker:audit`: Verifica o uso de disco atual.
- `npm run docker:clean`: Limpeza segura (recomendado semanalmente).
- `npm run docker:clean-all`: Limpeza profunda de imagens.
- `npm run docker:reset-supa`: Para o Supabase e apaga volumes locais (Hard Reset).

### Dicas de Estabilização

1. **Build Cache:** Se você notar que o disco está cheio mesmo após limpar imagens, tente `docker builder prune`.
2. **Volumes Órfãos:** Use `docker volume prune` para remover volumes que não estão vinculados a nenhum container.
3. **Docker Desktop:** Lembre-se que no Mac/Windows, o Docker reserva um arquivo de tamanho fixo. Às vezes é necessário resetar o Docker Desktop para recuperar espaço real no sistema host.

