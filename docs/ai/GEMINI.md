# GEMINI.md — Avalia Prudente: Gemini CLI Operational Guide

Este documento é o ponto de entrada oficial para os fluxos de trabalho de execução do Gemini CLI.

> **Regras Universais:** Todas as ações devem aderir estritamente a `docs/ai/shared-context.md`.

## 1. Fluxo de Execução do Repositório (Mandatório)
Toda tarefa deve seguir rigorosamente este ciclo de vida:
1. **Implement:** Realizar a alteração técnica.
2. **Lint:** Executar `npm run lint`.
3. **Build:** Executar `npm run build`.
4. **Test:** Executar `npm run test`.
5. **Update Docs:** Avaliar e atualizar `CHANGELOG.md`, `docs/current-state/*` e outros documentos relevantes (ver Seção 5 de `shared-context.md`).
6. **Commit:** Realizar o commit apenas após todos os passos acima passarem.

- **Topic Updates:** Sempre use `update_topic` para informar o progresso de tarefas complexas.
- **Análise Local:** Use `grep_search`, `list_directory` e `read_file` para mapear a base de código antes de executar mudanças.
- **Validação Empírica:** Priorize a reprodução de bugs ou a validação do estado atual localmente.

## 2. Fluxo de Commit e Memória do Projeto
- **Changelog Mandatório:** Atualize o `CHANGELOG.md` sob a tag `[Unreleased]` ou a versão atual antes de cada commit que altere o comportamento ou estrutura do sistema.
- **Sincronização de Documentação:** Se a arquitetura, dívida técnica ou funcionalidades implementadas mudarem, é OBRIGATÓRIO atualizar os arquivos correspondentes em `docs/current-state/` e `docs/generated/`.
- **Git Commit:** Adicione apenas os arquivos específicos modificados para a tarefa, incluindo as atualizações de documentação. Use Conventional Commits em inglês. NÃO faça push para o remoto, a menos que solicitado explicitamente.

## 3. Estratégia de Uso de Ferramentas
- **Edições Cirúrgicas:** Use `replace` para edições direcionadas. Garanta que `old_string` corresponda exatamente.
- **Eficiência de Leitura:** Evite ler arquivos inteiros se apenas uma seção específica for necessária (use `start_line` e `end_line`).
- **Paralelismo:** Execute ferramentas de leitura/busca independentes simultaneamente para economizar turnos.
- **Sub-agentes:** Use sub-agentes para tarefas repetitivas ou de alto volume para manter o histórico da sessão limpo.

## 4. Áreas Protegidas e Restrições Arquiteturais
- **Modificadores de Banco de Dados:** Não execute scripts bash arbitrários que modifiquem esquemas de banco de dados sem verificar `docs/ai/rules/database-rules.md`. Use `npm run supabase:migration`.
- **Guarda de Segurança do DB:** SEMPRE use os comandos prefixados com `npm run` para Supabase (ex: `npm run supabase:reset`) para disparar o script de proteção (`scripts/db-safety.sh`).
- **Recursão RLS:** NUNCA escreva políticas RLS que consultem `profiles` diretamente. SEMPRE use a função security definer `is_admin()` para evitar loops infinitos (Erro 500).
- **Bypass de Moderação:** Admins (`role = 'admin'`) DEVEM ignorar todos os bloqueios de moderação. Esta lógica está centralizada em `src/middleware.ts` e na camada de banco de dados.
- **Visibilidade Pública:** SEMPRE filtre itens com `is_frozen = true` em consultas públicas e políticas RLS públicas.
- **Integridade de Slugs:** Qualquer atualização de slug deve ser validada via `is_slug_available` e verificar rotas reservadas do sistema. Slugs devem ser normalizados para minúsculas.
- **Renderização OG:** Tenha cuidado ao editar `src/app/opengraph-image.tsx`. Ele roda no runtime Edge e possui limitações estritas (sem bibliotecas pesadas, sem acesso ao FS local).

## 5. Verificação e Sincronização Final (Checklist)
Antes de considerar uma tarefa como concluída, verifique:
- [ ] O Admin ainda consegue acessar `/admin/dashboard` (se houve mudança em auth/middleware)?
- [ ] `npm run lint`, `npm run build` e `npm run test` passam sem erros?
- [ ] O `CHANGELOG.md` foi atualizado com as mudanças?
- [ ] Os documentos em `docs/current-state/` refletem o novo estado (funcionalidades, bugs, dívida)?
- [ ] Se houve mudança arquitetural, `docs/ARCHITECTURE.md` ou ADRs foram atualizados?
- [ ] Empresas com `is_frozen` continuam inacessíveis via rotas públicas?

## 6. Melhores Práticas Operacionais do Gemini
- **Estratégia de Commit Isolado:** Comite as mudanças em lotes pequenos e lógicos.
- **Evolução Incremental:** Não realize reescritas amplas. Evolua a arquitetura incrementalmente.
- **Disciplina de Migração Segura:** Sempre valide migrações localmente com `npm run supabase:reset` antes de prosseguir.
- **Segurança em Produção:** Nunca use `--force` or flags destrutivas similares em ambientes remotos.
