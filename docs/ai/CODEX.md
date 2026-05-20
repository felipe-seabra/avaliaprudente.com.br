# CODEX.md — Avalia Prudente: Codex CLI Operational Guide

Este documento é o ponto de entrada oficial para os fluxos de trabalho de execução do Codex CLI.

> **Regras Universais:** Todas as ações devem aderir estritamente a `docs/ai/shared-context.md`.

## 1. Filosofia de Execução do Workspace
- **Terminal-Native Workflow:** O Codex CLI opera primariamente via terminal. Utilize ferramentas de busca e manipulação de arquivos com precisão cirúrgica.
- **Execução Autônoma:** Espera-se que o Codex identifique, analise e resolva problemas de forma independente, seguindo o ciclo: Pesquisa -> Estratégia -> Implementação -> Validação.
- **Minimalismo Operacional:** Evite leituras extensas e desnecessárias. Foque no contexto relevante para a tarefa imediata.

## 2. Fluxo de Trabalho e Validação (Mandatório)
Toda tarefa deve seguir rigorosamente este ciclo de vida:
1. **Implement:** Realizar a alteração técnica.
2. **Lint:** Executar `npm run lint`.
3. **Build:** Executar `npm run build`.
4. **Test:** Executar `npm run test`.
5. **Update Docs:** Avaliar e atualizar `CHANGELOG.md`, `docs/current-state/*` e outros documentos relevantes (ver Seção 5 de `shared-context.md`).
6. **Commit:** Realizar o commit apenas após todos os passos acima passarem.

- **Análise Prévia:** Antes de qualquer alteração, mapeie as dependências e o impacto arquitetural.
- **Reprodução de Bugs:** Sempre tente reproduzir falhas localmente antes de aplicar correções.

## 3. Disciplina de Commit e Git
- **Changelog Mandatório:** Atualize o `CHANGELOG.md` antes de cada commit que altere o comportamento ou estrutura do sistema.
- **Sincronização de Documentação:** Mantenha os arquivos em `docs/current-state/` e `docs/generated/` atualizados com o progresso real. O Codex não deve terminar o trabalho sem sincronizar o estado operacional.
- **Commits Atômicos:** Realize commits pequenos e focados. Nunca misture refatorações com correções de bugs em um único commit.
- **Conventional Commits:** Utilize o padrão `type(scope): description` in English.

## 4. Governança e Segurança (Mandatório)
- **Shared Context:** O Codex CLI deve herdar todas as regras definidas em `docs/ai/shared-context.md`.
- **Áreas Protegidas:** Alterações em `src/middleware.ts`, migrações de banco de dados e lógica de RLS exigem cuidado redobrado e verificação contra as regras de segurança estabelecidas.
- **Segurança do DB:** Utilize sempre `npm run` para comandos do Supabase para garantir a execução do `scripts/db-safety.sh`.
- **Multi-tenant Isolation:** Respeite rigorosamente o isolamento de inquilinos via `owner_id` e políticas RLS.

## 5. Áreas Críticas de Arquitetura
- **Recursão RLS:** Use a função `is_admin()` para evitar loops infinitos em políticas de segurança.
- **Anti-Spam & Analytics:** Respeite os gatilhos de banco de dados e a lógica de deduplicação de eventos.
- **OG Image System:** Respeite as restrições do Edge Runtime em `src/app/opengraph-image.tsx`.
- **Bypass de Moderação:** Garanta que administradores sempre tenham acesso total, contornando bloqueios de moderação.

## 6. Verificação e Sincronização Final (Checklist)
Antes de considerar uma tarefa como concluída, verifique:
- [ ] O Admin ainda consegue acessar `/admin/dashboard` (se houve mudança em auth/middleware)?
- [ ] `npm run lint`, `npm run build` e `npm run test` passam sem erros?
- [ ] O `CHANGELOG.md` foi atualizado com as mudanças?
- [ ] Os documentos em `docs/current-state/` refletem o novo estado?
- [ ] Se houve mudança arquitetural, `docs/ARCHITECTURE.md` ou ADRs foram atualizados?
- [ ] Eficiência de Contexto: As mudanças foram aplicadas com o mínimo de ruído e máxima precisão?

## 7. Melhores Práticas Operacionais
- **Evolução Incremental:** Não realize reescritas amplas sem necessidade. Evolua a base de código de forma estável.
- **Verificação de Regressão:** Após mudanças em Auth ou Middleware, valide o acesso do Admin ao dashboard.
- **Eficiência de Contexto:** Utilize ferramentas como `grep_search` para localizar pontos de interesse rapidamente.
