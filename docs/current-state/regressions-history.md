# Regressions History

Este documento rastreia regressões conhecidas e corrigidas para evitar que se repitam.

## [2026-05-16] Recursão Infinita em Políticas RLS
- **Problema:** A política RLS da tabela `profiles` tentava consultar a própria tabela `profiles` para verificar se o usuário era admin, causando recursão infinita e erro 500.
- **Causa:** Uso de subquery na mesma tabela protegida pela política.
- **Correção:** Simplificação da política ou uso de funções RPC que ignoram RLS temporariamente (Security Definer).
- **Prevenção:** Evitar subqueries circulares em políticas RLS.

## [2026-05-16] Falha de Acesso Público a Logos
- **Problema:** Logos de empresas não apareciam para usuários não autenticados.
- **Causa:** Bucket do Supabase Storage estava configurado como privado e sem políticas de leitura pública.
- **Correção:** Configuração do bucket `business-assets` como público e adição de política `SELECT` para usuários anônimos.
- **Prevenção:** Sempre testar visualização anônima ao adicionar novos assets.
