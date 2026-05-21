# Supabase Auth Configuration Guide

Este guia detalha as configurações necessárias no dashboard do Supabase para garantir que os redirecionamentos de autenticação e os e-mails funcionem corretamente no ambiente de produção.

## 1. Configuração de URL (URL Configuration)

No dashboard do Supabase, vá em **Authentication -> URL Configuration** e configure os seguintes campos:

- **Site URL:** `https://avaliaprudente.com.br`
- **Redirect URLs:** 
  - `https://avaliaprudente.com.br/auth/callback`
  - `https://avaliaprudente.com.br/auth/callback?next=*`
  - `https://avaliaprudente.com.br/reset-password`

*Nota: Certifique-se de que não haja `http://localhost:3000` nestes campos em produção.*

## 2. Provedores de Autenticação para Avaliações

O fluxo público de avaliações exige autenticação antes do envio.

- **Google OAuth:** Deve permanecer habilitado em **Authentication -> Providers -> Google**. Configure o Client ID/Secret do Google Cloud e mantenha o callback do Supabase autorizado no projeto Google.
- **Magic Link:** Deve permanecer habilitado como fallback de baixo atrito para consumidores que não queiram usar Google.
- **Redirecionamento contextual:** O frontend envia o usuário para `/auth/callback?next=/r/{slug}?review=1`, preservando o retorno para a página pública após autenticação.
- **LGPD:** O e-mail autenticado não deve ser exibido em reviews. A identidade pública da avaliação é apenas `display_name`.

## 3. Templates de E-mail Personalizados

Para uma experiência profissional e alinhada à marca **Avalia Prudente**, utilize os templates HTML abaixo em **Authentication -> Email Templates**.

### A. Confirm Signup (Confirmação de Cadastro)

**Subject:** `Confirme sua conta no Avalia Prudente`

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://avaliaprudente.com.br/branding/logo-horizontal.webp" alt="Avalia Prudente" style="max-width: 200px;">
  </div>
  <h2 style="color: #0f172a; text-align: center;">Bem-vindo ao Avalia Prudente!</h2>
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Olá! Ficamos felizes em ter você conosco. Para começar a gerenciar suas avaliações e fortalecer sua presença local, por favor confirme seu e-mail clicando no botão abaixo:
  </p>
  <div style="text-align: center; margin: 40px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Confirmar minha conta</a>
  </div>
  <p style="color: #64748b; font-size: 14px; text-align: center;">
    Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
    <br>
    <span style="word-break: break-all; color: #3b82f6;">{{ .ConfirmationURL }}</span>
  </p>
  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    Este é um e-mail automático do Avalia Prudente. Se você não solicitou este cadastro, pode ignorar este e-mail.
  </p>
</div>
```

### B. Reset Password (Redefinição de Senha)

**Subject:** `Redefina sua senha - Avalia Prudente`

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://avaliaprudente.com.br/branding/logo-horizontal.webp" alt="Avalia Prudente" style="max-width: 200px;">
  </div>
  <h2 style="color: #0f172a; text-align: center;">Redefinição de Senha</h2>
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Você solicitou a redefinição de sua senha no Avalia Prudente. Clique no botão abaixo para escolher uma nova senha:
  </p>
  <div style="text-align: center; margin: 40px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Redefinir minha senha</a>
  </div>
  <p style="color: #64748b; font-size: 14px; text-align: center;">
    Se você não solicitou a redefinição de senha, nenhuma ação é necessária.
  </p>
  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    Avalia Prudente - Fortalecendo o comércio local.
  </p>
</div>
```

### C. Magic Link

**Subject:** `Seu link de acesso ao Avalia Prudente`

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://avaliaprudente.com.br/branding/logo-horizontal.webp" alt="Avalia Prudente" style="max-width: 200px;">
  </div>
  <h2 style="color: #0f172a; text-align: center;">Login Rápido</h2>
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Clique no botão abaixo para entrar instantaneamente na sua conta do Avalia Prudente:
  </p>
  <div style="text-align: center; margin: 40px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Entrar agora</a>
  </div>
  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    Este link expira em breve. Se você não solicitou este acesso, ignore este e-mail.
  </p>
</div>
```

## 4. Variáveis de Ambiente (Vercel)

Certifique-se de que a variável `NEXT_PUBLIC_APP_URL` esteja configurada na Vercel como `https://avaliaprudente.com.br`.

Se esta variável não estiver definida, o sistema usará o fallback configurado em `src/lib/constants.ts`, que agora está apontando corretamente para `https://avaliaprudente.com.br`.
