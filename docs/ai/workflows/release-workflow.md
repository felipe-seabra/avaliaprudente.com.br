# Release Workflow

## 1. Preparação da Versão
- Incremente a versão no `package.json`.
- Consolide o `CHANGELOG.md` removendo a seção `[Unreleased]` para a nova versão.

## 2. Validação Final
- Execute um build limpo em ambiente de staging/produção.
- Verifique variáveis de ambiente.

## 3. Deployment
- Siga as instruções em `docs/DEPLOYMENT.md`.
- Monitore logs após o deploy para identificar erros imediatos.

## 4. Pós-Deploy
- Realize o commit da versão e tagueie no Git.
- Comunique as mudanças aos stakeholders, se necessário.
