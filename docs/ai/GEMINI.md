# GEMINI.md — Avalia Prudente: Gemini CLI Operational Guide

Este documento define os padrões operacionais para o Gemini CLI neste repositório, garantindo que suas ações estejam alinhadas com a arquitetura de segurança endurecida da plataforma.

> **Regras Universais:** Todas as ações DEVEM aderir estritamente a `docs/ai/shared-context.md`.

## 1. Ciclo de Execução e Validação (Mandatório)
Toda tarefa deve seguir rigorosamente:
1. **Branch Protection:** Validar que NÃO está na `main` local. Se estiver, crie uma feature branch antes de qualquer alteração.
2. **Research:** Mapear o código e entender os limites de confiança antes de editar.
3. **Strategy:** Propor uma abordagem que preserve a segurança (RLS, Cache, Privacy).
4. **Implement:** Aplicação de mudanças cirúrgicas EXCLUSIVAMENTE em feature branches.
5. **Validation:**
    - `npm run lint` && `npm run build` && `npm run test`.
    - Verificar acesso Admin se houver mudanças em Middleware/Auth.
6. **Sync Docs:** Atualizar `CHANGELOG.md` e `docs/current-state/*`.

## 2. Governança de Segurança Específica
- **Main Branch Immutability:** É TERMINANTEMENTE PROIBIDO commitar na `main` local. Siga o workflow de PR.
- **Context Awareness:** Antes de sugerir mudanças, use `grep_search` para verificar se a área é uma **Protected Area** definida no `shared-context.md`.
- **RLS Safety:** NUNCA escreva políticas RLS que consultem `profiles` diretamente. Use as funções security definer `is_admin()`.
- **Public Data Protection:** Sempre adicione filtros para `is_frozen = true` em qualquer nova consulta pública.
- **Sudo Mode:** Ao implementar ações administrativas, garanta que elas exijam `sudo` (reautenticação).
- **Cache Isolation:** Certifique-se de que novos componentes SSR não vazem dados privados via cache público.

## 3. Eficiência de Contexto e Ferramentas
- **Leitura Cirúrgica:** Use `start_line` e `end_line` para evitar leitura de arquivos gigantes.
- **Paralelismo:** Execute buscas e leituras independentes no mesmo turno.
- **Topic Updates:** Mantenha o usuário informado sobre o progresso e decisões arquiteturais via `update_topic`.

## 4. Checklist de Finalização (Checklist)
Antes de concluir qualquer tarefa:
- [ ] Você está em uma feature branch (NÃO na main)?
- [ ] O Admin ainda consegue acessar `/admin/dashboard`?
- [ ] O super_admin continua com bypass total de restrições comerciais?
- [ ] Novas features estão protegidas por `canUseFeature` ou `FeatureGate`?
- [ ] As políticas RLS foram testadas contra vazamento de tenant?
- [ ] Nenhum IP ou dado sensível está sendo logado/persistido em texto puro?
- [ ] O `CHANGELOG.md` foi atualizado?
- [ ] `npm run build` passou sem erros de tipo ou cache?

## 5. Estratégia de Commit
- **Feature Branches Only:** Todo código flui via `feature branch -> PR -> Merge`.
- **Conventional Commits** em Inglês.
- Comites atômicos (não misture fix com refactor).
- Nunca faça push para o remoto sem solicitação.
