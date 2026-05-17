# Debug Workflow

## 1. Reprodução
- Identifique os passos exatos para reproduzir o bug.
- Crie um script de reprodução ou um teste falho, se possível.

## 2. Análise de Causa Raiz
- Verifique logs do servidor e do console do navegador.
- Analise as políticas de RLS no Supabase se o erro for relacionado a dados.
- Verifique o Middleware para problemas de sessão ou redirecionamento.

## 3. Correção
- Aplique a correção mínima necessária.
- Evite refatorações não relacionadas durante o debug.

## 4. Verificação de Regressão
- Garanta que a correção não quebrou outras partes do sistema.
- Valide fluxos dependentes (ex: se corrigiu o login, verifique o registro).

## 5. Documentação
- Registre o bug em `docs/current-state/known-bugs.md` (se ainda não resolvido) ou no `CHANGELOG.md` (como fix).
