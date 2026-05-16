# Production Deployment Guide

Este guia descreve os procedimentos para colocar a plataforma Avalia Prudente em produção, migrando do ambiente local para o Supabase Cloud.

## Infraestrutura Recomendada

- **Frontend:** Vercel (Next.js 15)
- **Backend/DB/Auth:** Supabase Cloud
- **Domínio:** Vercel DNS ou Cloudflare

## Migração para Supabase Cloud

Siga estes passos para migrar seu banco de dados local para a nuvem:

### 1. Vincular o Projeto
No terminal, execute o comando abaixo para vincular seu repositório local ao seu projeto do Supabase Cloud:
```bash
npx supabase link --project-ref <project-id>
```
*O `project-id` pode ser encontrado na URL do seu dashboard do Supabase.*

### 2. Push do Schema (Migrações)
Após vincular, envie todas as migrações criadas localmente para o banco de dados de produção:
```bash
npx supabase db push
```
*Isso garantirá que todas as tabelas, RLS, triggers e funções sejam criadas exatamente como no ambiente local.*

### 3. Configuração de Auth (Dashboard)
No dashboard do Supabase Cloud, vá em **Authentication -> URL Configuration**:
- **Site URL:** `https://avaliaprudente.com.br`
- **Redirect URLs:** Adicione `https://avaliaprudente.com.br/auth/callback`

## Checklist de Produção

### 1. Configuração do Supabase (Produção)
- [x] Criar novo projeto no Supabase Cloud.
- [x] Rodar as migrações locais no projeto de produção (`npx supabase db push`).
- [ ] Habilitar **Point-in-Time Recovery (PITR)** se disponível.
- [ ] Configurar o provedor de e-mail (SMTP próprio ou SendGrid/Resend).

### 2. Configuração da Vercel
- [ ] Conectar o repositório GitHub à Vercel.
- [ ] Configurar as **Environment Variables** (usando as chaves do Supabase Cloud).
- [ ] Configurar o domínio customizado.

### 3. Segurança
- [x] Validar que `validateEnv()` está ativo.
- [x] Políticas de **RLS** validadas e aplicadas.
- [x] Headers de segurança (CSP) configurados.

## Estratégia de Backup e Rollback
...

- **Banco de Dados:** O Supabase realiza backups diários automaticamente. Para o plano Pro, o PITR permite restaurar o banco para qualquer segundo nos últimos 7 dias.
- **Storage:** Recomenda-se um script periódico para espelhar o bucket do Supabase Storage para um AWS S3 ou similar.

## Estratégia de Rollback

- **Frontend (Vercel):** Utilize o "Instant Rollback" do dashboard da Vercel para voltar a um deployment anterior em segundos.
- **Banco de Dados:** Em caso de migração mal-sucedida, utilize a restauração do Supabase para o backup mais recente antes da alteração.

## Variáveis de Ambiente Necessárias

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_APP_URL` | URL base do site (ex: https://avaliaprudente.com.br) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API do Supabase de produção |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta de serviço (NUNCA expor no cliente) |

## Operação Real-World

- **Monitoramento:** Utilize o **Vercel Analytics** e os logs do Supabase para acompanhar o tráfego.
- **Erros:** Verifique o painel de "In-App Analytics" do Supabase para identificar picos de erros de autenticação ou DB.
