# Technical Debt: Avalia Prudente

## Arquitetura
- [ ] **Camada de Application (Use Cases):** Atualmente, os hooks chamam repositórios diretamente. É necessário implementar a camada de Use Cases em `src/core/application` para desacoplar a lógica de negócio do framework.
- [ ] **Instanciação de Repositórios:** Repositórios estão sendo instanciados via `new Repository()` dentro de hooks e componentes. O ideal seria utilizar um padrão de Injeção de Dependência ou Factory.

## Infraestrutura
- [ ] **Rate Limiting Distribuído:** Substituir o `Map` em memória do Middleware por uma solução distribuída (Upstash Redis ou similar) para garantir consistência em produção.
- [ ] **Testes Automatizados:** Cobertura de testes unitários e de integração é atualmente baixa/inexistente. Prioridade para lógica de Ranking e RLS.

## Código & Performance
- [ ] **Separação de Repositórios:** Alguns arquivos de infraestrutura (ex: `supabase-page-repository.ts`) contêm múltiplas classes. Devem ser separados por entidade.
- [ ] **Tipagem do Supabase:** Embora existam tipos gerados, algumas consultas complexas ainda utilizam `any` ou casts manuais em partes profundas da infraestrutura.
- [ ] **Bundle Size:** Verificar impacto de bibliotecas como `dnd-kit` e `lucide-react` no bundle final e aplicar code-splitting onde necessário.
