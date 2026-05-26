# Commit Rules

## 1. Conventional Commits
- Siga o padrão: `type(scope): description`.
- Tipos permitidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `perf`, `test`, `build`, `ci`, `revert`.

## 2. Idioma
- Mensagens de commit devem ser escritas em **Inglês**.
- Use o imperativo (ex: `add feature` em vez de `added feature`).

## 3. Atomicidade
- Realize commits pequenos e focados em uma única tarefa.
- Evite commits "wip" ou que misturem mudanças não relacionadas.

## 4. Documentação
- Commits que alteram lógica de negócio devem atualizar o `CHANGELOG.md` e, se necessário, os registros de memória do projeto.

## 5. Branch Enforcement
- **Local Main is Protected:** NUNCA realize commits diretamente na branch `main` local.
- **Feature Branches Required:** Todo trabalho deve ser realizado em branches de feature ou fix (`feat/...`, `fix/...`).
- **Synchronized Main:** Mantenha a branch `main` local sempre sincronizada com `origin/main`.
- **Merge via PR:** O merge para `main` deve ocorrer exclusivamente através de Pull Requests validados pelo CI.
