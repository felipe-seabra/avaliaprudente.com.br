#!/bin/bash

# Database Safety Guard for Avalia Prudente
# Prevents accidental destructive operations on remote/production databases.

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMMAND=$1
SHIFT_ARGS="${@:2}"

# 1. Environment Detection
IS_REMOTE=false
ENV_NAME="LOCAL (Docker)"

if [[ "$SHIFT_ARGS" == *"--linked"* ]] || [[ "$COMMAND" == "db push" ]]; then
    IS_REMOTE=true
    ENV_NAME="REMOTE (Supabase Cloud)"
fi

# 2. Visual Header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  AVALIA PRUDENTE - DATABASE SAFETY GUARD${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Ambiente Detectado: ${YELLOW}${ENV_NAME}${NC}"
echo -e "Comando: ${GREEN}supabase $COMMAND $SHIFT_ARGS${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# 3. Safety Logic
if [ "$IS_REMOTE" = true ]; then
    echo -e "${RED}⚠️  ATENÇÃO: Operação remota detectada!${NC}"
    echo -e "Você está prestes a executar um comando destrutivo ou de alteração de schema em um projeto Supabase Cloud."
    echo ""
    
    # Try to identify project ref if linked
    if [ -f ".supabase/project-ref" ]; then
        PROJECT_REF=$(cat .supabase/project-ref)
        echo -e "Project Ref: ${YELLOW}${PROJECT_REF}${NC}"
    fi

    echo ""
    echo -e "${RED}Deseja realmente continuar? (digite o nome do ambiente 'remoto' para confirmar)${NC}"
    read -p "> " confirm
    
    if [[ "$confirm" != "remoto" ]]; then
        echo -e "${YELLOW}Operação abortada pelo usuário.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Confirmação recebida. Prosseguindo...${NC}"
fi

# 4. Command Execution
case "$COMMAND" in
    "db reset")
        echo -e "${YELLOW}Executando Reset de Banco de Dados...${NC}"
        npx supabase db reset $SHIFT_ARGS
        ;;
    "db push")
        echo -e "${YELLOW}Executando Push de Migrações...${NC}"
        npx supabase db push $SHIFT_ARGS
        ;;
    "status")
        npx supabase status $SHIFT_ARGS
        ;;
    "migration")
        npx supabase migration $SHIFT_ARGS
        ;;
    *)
        npx supabase $COMMAND $SHIFT_ARGS
        ;;
esac

echo -e "${BLUE}==================================================${NC}"
