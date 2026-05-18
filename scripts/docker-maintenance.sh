#!/bin/bash

# Docker Maintenance Script for avaliaprudente.com.br
# This script helps manage Docker disk usage safely.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function show_usage() {
    echo -e "${GREEN}Uso: $0 [comando]${NC}"
    echo ""
    echo "Comandos:"
    echo "  audit       - Analisa o uso atual do Docker (imagens, volumes, cache)"
    echo "  clean       - Limpeza segura (containers parados, redes não usadas, imagens órfãs)"
    echo "  clean-all   - Limpeza agressiva (remove TODAS as imagens não utilizadas por containers ativos)"
    echo "  clean-cache - Limpa o cache de build do Docker"
    echo "  reset-supa  - Para o Supabase e remove seus volumes (ATENÇÃO: Deleta dados locais do DB)"
    echo "  help        - Mostra esta mensagem"
}

function audit() {
    echo -e "${YELLOW}--- Auditoria de Uso do Docker ---${NC}"
    docker system df
    echo ""
    echo -e "${YELLOW}--- Top 10 Maiores Imagens ---${NC}"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -hk 3 -r | head -n 11
    echo ""
    echo -e "${YELLOW}--- Volumes do Projeto ---${NC}"
    docker volume ls | grep "avaliaprudente" || echo "Nenhum volume do projeto encontrado."
}

function clean_safe() {
    echo -e "${YELLOW}Executando limpeza segura...${NC}"
    echo "Removendo containers parados, redes não utilizadas e imagens órfãs (dangling)..."
    docker system prune -f
}

function clean_all() {
    echo -e "${YELLOW}Executando limpeza completa de imagens...${NC}"
    echo "Removendo TODAS as imagens não utilizadas por containers em execução..."
    docker image prune -a -f
}

function clean_cache() {
    echo -e "${YELLOW}Limpando cache de build...${NC}"
    docker builder prune -f
}

function reset_supabase() {
    echo -e "${RED}AVISO: Isso irá parar o Supabase e APAGAR todos os dados do banco de dados local!${NC}"
    read -p "Tem certeza que deseja continuar? (s/N) " confirm
    if [[ "$confirm" == "s" || "$confirm" == "S" ]]; then
        echo "Parando Supabase e removendo volumes..."
        npx supabase stop --clean
        echo -e "${GREEN}Supabase resetado com sucesso.${NC}"
    else
        echo "Operação cancelada."
    fi
}

case "$1" in
    audit)
        audit
        ;;
    clean)
        clean_safe
        ;;
    clean-all)
        clean_all
        ;;
    clean-cache)
        clean_cache
        ;;
    reset-supa)
        reset_supabase
        ;;
    help|*)
        show_usage
        ;;
esac
