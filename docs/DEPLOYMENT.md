# Production Deployment Guide

Este guia descreve os procedimentos para colocar a plataforma Avalia Prudente em produção.

## Infraestrutura Recomendada

- **Frontend:** Vercel (Next.js 15)
- **Backend/DB/Auth:** Supabase Cloud
- **Domínio:** Vercel DNS ou Cloudflare

## Checklist de Produção

### 1. Configuração do Supabase (Produção)
- [ ] Criar novo projeto no Supabase Cloud.
- [ ] Rodar as migrações locais no projeto de produção:
  ```bash
  npx supabase db push
  ```
- [ ] Habilitar **Point-in-Time Recovery (PITR)** se disponível.
- [ ] Configurar os domínios permitidos no Supabase Auth (Redirect URLs).
- [ ] Configurar o provedor de e-mail (SMTP próprio ou SendGrid/Resend).

### 2. Configuração da Vercel
- [ ] Conectar o repositório GitHub à Vercel.
- [ ] Configurar as **Environment Variables** (idênticas ao `.env.example`).
- [ ] Habilitar o **Vercel KV** para Rate Limiting distribuído (opcional, mas recomendado).
- [ ] Configurar o domínio customizado (`avaliaprudente.com.br`).

### 3. Segurança
- [ ] Validar que `validateEnv()` está sendo chamado no Root Layout.
- [ ] Revisar as políticas de **RLS (Row Level Security)** no banco de dados.
- [ ] Garantir que o **CSP (Content Security Policy)** no `next.config.ts` não está bloqueando recursos essenciais.

## Estratégia de Backup

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
