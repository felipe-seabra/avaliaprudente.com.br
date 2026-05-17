# Feature Workflow

## 1. Pesquisa e Planejamento
- Entenda os requisitos da funcionalidade.
- Analise os arquivos relacionados e o impacto na arquitetura.
- Valide se novas tabelas ou migrações são necessárias.

## 2. Estratégia de Implementação
- Defina as entidades do domínio.
- Crie ou atualize os repositórios necessários.
- Desenvolva os componentes de UI seguindo o padrão shadcn/ui.

## 3. Desenvolvimento Iterativo
- Implemente em pequenos incrementos.
- Realize commits frequentes seguindo as `commit-rules.md`.
- Garanta que a tipagem TypeScript esteja correta.

## 4. Validação
- Execute `npm run lint`.
- Execute `npm run build`.
- Adicione testes unitários se a lógica for complexa.

## 5. Finalização
- Atualize o `CHANGELOG.md`.
- Atualize a documentação de memória se houver novas regras de negócio.
- Realize o commit final.
