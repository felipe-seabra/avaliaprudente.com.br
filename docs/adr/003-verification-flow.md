# ADR 003: Verification Flow

## Contexto
Para garantir a confiabilidade dos rankings, precisamos distinguir empresas validadas de empresas autodeclaradas.

## Decisão
Implementamos um sistema de **Solicitação de Verificação** em vez de permitir que o usuário marque sua própria empresa como verificada.
- O usuário envia uma solicitação (`verification_requests`).
- Um administrador revisa e aprova/rejeita.
- O status `is_verified` na tabela `businesses` é atualizado apenas via Trigger ou ação de Admin.

## Consequências
- **Positivas:** Integridade do selo de confiança; controle centralizado de qualidade.
- **Negativas:** Exige esforço manual de moderação.

## Tradeoffs
A credibilidade da plataforma é prioritária em relação à automação total do onboarding.
