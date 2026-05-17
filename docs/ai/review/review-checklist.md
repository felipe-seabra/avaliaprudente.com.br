# Review Checklist

Este checklist deve ser utilizado por desenvolvedores e IAs antes de qualquer merge ou deploy.

## 1. Regressões e Segurança
- [ ] A alteração afeta o `middleware.ts` ou políticas de RLS? Se sim, foram testados cenários de acesso não autorizado?
- [ ] O isolamento de multi-tenant (`owner_id`) foi preservado?
- [ ] Existe algum risco de loop de redirecionamento?

## 2. Arquitetura e Código
- [ ] O código segue os princípios de Clean Architecture?
- [ ] A lógica de negócio está no domínio/repositório e não diretamente no componente de UI?
- [ ] Foram detectadas lógicas duplicadas que poderiam ser abstraídas?
- [ ] O código introduz complexidade desnecessária?

## 3. TypeScript e Estilo
- [ ] O código está livre de erros de TypeScript?
- [ ] Foi utilizado `any` desnecessariamente?
- [ ] O lint (`npm run lint`) passa sem avisos?
- [ ] As regras de commit foram seguidas?

## 4. Áreas Protegidas
- [ ] Se houve alteração no sistema de autenticação, o fluxo de callback foi testado?
- [ ] Se houve alteração no sistema de verificação, o impacto nos rankings foi analisado?

## 5. Validação Técnica
- [ ] `npm run build` completa com sucesso?
- [ ] O `CHANGELOG.md` foi atualizado?
- [ ] Novas variáveis de ambiente foram documentadas no `.env.example`?
