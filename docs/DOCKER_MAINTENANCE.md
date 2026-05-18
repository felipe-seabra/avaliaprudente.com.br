# Manutenção do Docker e Supabase Local

Este documento descreve as práticas recomendadas para gerenciar o uso de disco do Docker e do Supabase no ambiente de desenvolvimento local.

## Problema: Alto consumo de disco

O ambiente local do Supabase utiliza múltiplos contêineres Docker e volumes persistentes. Com o tempo, imagens antigas, cache de build e volumes órfãos podem acumular dezenas de gigabytes de espaço.

## Ferramentas de Manutenção

Implementamos scripts para facilitar a auditoria e limpeza do ambiente.

### 1. Auditoria
Para ver quanto espaço o Docker está consumindo e quais são as maiores imagens:
```bash
npm run docker:audit
```

### 2. Limpeza Segura (Recomendado Semanalmente)
Remove apenas contêineres parados, redes não utilizadas e imagens "dangling" (sem tag, geralmente sobras de builds interrompidos). **Não remove dados do banco de dados.**
```bash
npm run docker:clean
```

### 3. Limpeza Profunda de Imagens
Remove todas as imagens que não estão sendo usadas por contêineres em execução. Útil se você atualizou o Supabase CLI ou trocou de versão do Node/Next.js no Docker.
```bash
npm run docker:clean-all
```

### 4. Reset Total do Supabase
Se o banco de dados local estiver muito pesado ou corrompido, você pode resetá-lo completamente. **ISSO APAGARÁ TODOS OS DADOS LOCAIS.**
```bash
npm run docker:reset-supa
```

---

## Dicas para Economizar Espaço

### Gerenciamento do Docker Desktop (Mac/Windows)
O Docker Desktop reserva um arquivo de disco virtual (`Docker.raw` no Mac) que nem sempre diminui de tamanho após uma limpeza.
*   **Dica:** Vá em *Settings > Resources > Disk image location* para ver onde ele está.
*   **Dica:** Se o arquivo continuar enorme após `docker system prune`, pode ser necessário usar o botão "Clean / Purge data" nas configurações do Docker Desktop (ícone de inseto no topo -> Troubleshoot).

### Camadas de Build
Ao trabalhar com Dockerfiles personalizados, utilize `.dockerignore` para evitar que pastas como `node_modules` e `.next` sejam enviadas para o contexto de build desnecessariamente, o que aumenta o cache de build.

### Volumes do Supabase
O Supabase armazena dados em volumes Docker. Se você tiver múltiplos projetos Supabase na mesma máquina, cada um terá seus próprios volumes. Use `docker volume ls` para identificar volumes de projetos que você não usa mais e remova-os com `docker volume rm <nome_do_volume>`.
