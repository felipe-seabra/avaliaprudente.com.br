# Git Summary: Avalia Prudente

## Marcos Recentes

### Premium UX Retention Flow (2026-05-22)
- Replaced automatic Google redirect with an optional, high-retention CTA.
- Implemented new-tab navigation for external reviews.
- Commit: `eef5619`

### v0.2.1 - Estabilização do Sistema de Verificação (2026-05-17)
- Consolidação do esquema de banco de dados para verificação.
- Implementação de botões de controle direto para administradores.
- Correção de inconsistências de status (`verified` -> `approved`).
- Hardening de políticas RLS para solicitações de verificação.

### v0.2.0 - Lançamento do Sistema de Verificação e Rankings (2026-05-17)
- Introdução do fluxo completo de solicitação de selo oficial.
- Implementação do algoritmo de Ranking Bayesiano para a "Elite da Cidade".
- Criação do painel de moderação para administradores.
- Adição de indicadores de confiança (badges) nas páginas públicas.

### Evolução NFC-First (Fase Anterior)
- Transição de um simples site de avaliações para uma plataforma modular de links via NFC.
- Implementação do Editor de Página Drag-and-Drop.
- Sistema de Analytics para cliques e visitas.
- Geração de QR Codes personalizados com marca própria.

## Padrões de Commit
O projeto utiliza **Conventional Commits**:
- `feat`: Novas funcionalidades.
- `fix`: Correções de bugs.
- `refactor`: Melhorias de código sem alteração de comportamento.
- `docs`: Atualizações de documentação.
- `chore`: Tarefas de manutenção.
