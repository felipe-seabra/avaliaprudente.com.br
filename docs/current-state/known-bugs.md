# Known Bugs: Avalia Prudente

## Críticos
*Nenhum bug crítico conhecido no momento.*

## UI/UX
- [ ] **Flash de Tema:** Pequeno flash de tema claro antes de carregar o dark mode em algumas transições de página (comum em `next-themes`).
- [ ] **Upload de Imagem:** Feedback visual durante o progresso do upload pode ser melhorado para arquivos maiores.

## Funcionais
- [ ] **Rate Limiting:** O limite de requisições no Middleware é em memória; reinicializações do servidor ou múltiplas instâncias (Vercel) resetam o contador.
- [ ] **Sincronização de Dados:** Em casos raros, a troca de empresa no Dashboard pode exigir um refresh manual para atualizar todos os contextos dependentes.

## Segurança
- [ ] **Políticas RLS:** Embora robustas, a complexidade das políticas de `profiles` e `businesses` exige auditoria constante para evitar recursão infinita (já corrigido uma vez).
