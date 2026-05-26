# CODEX.md — Avalia Prudente: Codex CLI Operational Guide

Este documento define os padrões de execução autônoma do Codex CLI, focando na integridade da plataforma e segurança operacional.

> **Regras Universais:** Todas as ações DEVEM aderir estritamente a `docs/ai/shared-context.md`.

## 1. Filosofia de Execução Segura
- **Codex-First Implementation:** O Codex é o runtime primário para implementação de features e correções rápidas.
- **Terminal-Native Governance:** Operação via terminal exige precisão cirúrgica no uso de `replace` e `run_shell_command`.
- **Autonomia Responsável:** O Codex deve identificar e mitigar riscos de segurança (vazamento de tenant, falha de RLS) proativamente durante a implementação.

## 2. Fluxo de Trabalho Mandatório
1. **Branch Check:** Validar se a branch atual é a `main`. Se sim, abortar e criar uma branch de feature (`git checkout -b feat/...`).
2. **Analyze:** Mapear dependências e limites de confiança (Trust Boundaries).
3. **Execute:** Mudanças minimais e idiomáticas em feature branch.
4. **Validate:**
    - `npm run lint` && `npm run build` && `npm run test`.
    - Testar bypass de admin em rotas de moderação.
5. **Document:** Sincronizar `CHANGELOG.md` e estados de feature.
6. **Commit:** Commits atômicos e assertivos.

## 3. Governança e Segurança
- **Shared Context Enforcement:** Herdar todas as regras de `docs/ai/shared-context.md`.
- **Main Branch Safety:** A branch `main` local é protegida e imutável para desenvolvimento direto.
- **Protected Areas:** Cuidado redobrado em `src/middleware.ts` e migrações SQL.
- **Database Safety:** SEMPRE use `npm run` para comandos Supabase para garantir o disparo de `scripts/db-safety.sh`.
- **RLS Recursion:** Proibido queries a `profiles` em RLS; use `is_admin()`.

## 4. Áreas Críticas de Arquitetura
- **Sudo Mode:** Operações administrativas exigem fluxo de `sudo`.
- **Public Visibility:** Filtro mandatório de `is_frozen = true`.
- **Anti-Spam:** Respeitar validações de fingerprint e cooldowns no servidor.
- **Edge Compatibility:** Manter `src/app/opengraph-image.tsx` leve e funcional no Edge Runtime.

## 5. Checklist de Verificação Final
- [ ] O Admin mantém acesso total?
- [ ] O isolamento de inquilinos (tenant isolation) está íntegro?
- [ ] O build passa sem erros de tipo ou cache?
- [ ] `CHANGELOG.md` reflete as mudanças?
- [ ] As regras de privacidade (LGPD) foram respeitadas?
