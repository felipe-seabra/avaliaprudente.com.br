# ADR 004: Clean Architecture Adoption

## Contexto
O projeto tende a crescer em complexidade. Precisamos de uma estrutura que permita trocar implementações técnicas (ex: mudar de Supabase para outro DB) sem reescrever a lógica de negócio.

## Decisão
Adoção gradativa de **Clean Architecture**.
- Camadas bem definidas: Domain, Application, Infrastructure.
- Uso de Repositórios para abstrair o acesso a dados.

## Consequências
- **Positivas:** Código mais testável e manutenível; separação clara de responsabilidades.
- **Negativas:** Mais "boilerplate" (classes extras, interfaces); curva de aprendizado para novos desenvolvedores.

## Tradeoffs
O custo inicial de desenvolvimento ligeiramente mais lento é compensado pela facilidade de manutenção a longo prazo.
