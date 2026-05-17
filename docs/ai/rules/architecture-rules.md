# Architecture Rules

## 1. Clean Architecture
- O projeto segue princípios de **Clean Architecture**.
- Camadas: `Domain` -> `Application` -> `Infrastructure` -> `UI`.
- As dependências devem apontar para dentro (Domain não depende de ninguém).
- Entidades devem ser POJOs/POCOs (sem dependência de frameworks).

## 2. Separation of Concerns
- Regras de negócio ficam no `Domain`.
- Orquestração de dados fica no `Application`.
- Implementações técnicas (Supabase, APIs) ficam no `Infrastructure`.
- Lógica de visualização e estado local fica na `UI`.

## 3. Dependency Inversion
- Use interfaces/tipos abstratos para definir repositórios no `Domain`.
- Implemente essas interfaces no `Infrastructure`.
- Injete dependências via construtores ou hooks (evite `new` dentro de componentes de UI sempre que possível).

## 4. Single Source of Truth
- Evite duplicação de estado.
- Use o `BusinessProvider` para estado global da empresa ativa.
- Use Supabase como a fonte autoritativa de dados.
