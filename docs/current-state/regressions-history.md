# Regressions History

Este documento rastreia regressões conhecidas e corrigidas para evitar que se repitam.

## [2026-05-16] Recursão Infinita em Políticas RLS
- **Problema:** A política RLS da tabela `profiles` tentava consultar a própria tabela `profiles` para verificar se o usuário era admin, causando recursão infinita e erro 500.
- **Causa:** Uso de subquery na mesma tabela protegida pela política.
- **Correção:** Simplificação da política ou uso de funções RPC que ignoram RLS temporariamente (Security Definer).
- **Prevenção:** Evitar subqueries circulares em políticas RLS.

## [2026-05-19] Perda de Metadados em Perfis (Trigger Sync)
- **Problema:** Atualizações no perfil do usuário via aplicação causavam a perda de metadados críticos (como aceite de termos) sincronizados pelo Auth.
- **Causa:** O trigger `handle_new_user` e as lógicas de update não estavam preservando campos incrementais de metadados em determinados fluxos.
- **Correção:** Refatoração da função `handle_new_user` e dos triggers de atualização para garantir o merge seguro de metadados do `auth.users`.
- **Prevenção:** Sempre usar `COALESCE` ou lógicas de merge ao sincronizar dados do Auth para o Profile.
