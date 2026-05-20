#!/bin/bash

# Database Safety Guard for Avalia Prudente
# Prevents accidental destructive operations on remote/production databases.

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

COMMAND=$1
SHIFT_ARGS="${@:2}"

# 1. Environment Detection & Ref
PROJECT_REF=""
if [ -f "supabase/.temp/project-ref" ]; then
    PROJECT_REF=$(cat supabase/.temp/project-ref)
elif [ -f ".supabase/project-ref" ]; then
    PROJECT_REF=$(cat .supabase/project-ref)
fi

# Determine Target Environment
IS_REMOTE=false
TARGET_ENV="LOCAL (Docker)"

if [[ "$SHIFT_ARGS" == *"--linked"* ]] || [[ "$COMMAND" == "db push" ]] || [[ "$SHIFT_ARGS" == *"--remote"* ]]; then
    IS_REMOTE=true
    if [[ "$PROJECT_REF" == "gfcnoowmfrzlrzusjcbc" ]]; then
        TARGET_ENV="REMOTE DEVELOPMENT (Supabase Cloud)"
    elif [ -n "$PROJECT_REF" ]; then
        TARGET_ENV="REMOTE (Project: $PROJECT_REF)"
    else
        TARGET_ENV="REMOTE (Unknown Project)"
    fi
fi

# 2. Safety Constraints
# Explicitly block destructive commands on remote unless OVERRIDE is provided
DESTRUCTIVE_COMMANDS=("db reset" "db push" "db pull")
FORCE_REMOTE=false
if [[ "$SHIFT_ARGS" == *"--force-remote"* ]]; then
    FORCE_REMOTE=true
    # Remove the internal flag from args passed to supabase cli
    SHIFT_ARGS=${SHIFT_ARGS//--force-remote/}
fi

# 3. Visual Header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  AVALIA PRUDENTE - DATABASE SAFETY GUARD${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Alvo: ${YELLOW}${TARGET_ENV}${NC}"
echo -e "Comando: ${GREEN}supabase $COMMAND $SHIFT_ARGS${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# 4. Safety Logic
if [ "$IS_REMOTE" = true ]; then
    echo -e "${RED}⚠️  ALERTA CRÍTICO: Operação remota detectada!${NC}"
    echo -e "Você está prestes a alterar o esquema ou dados de um banco de dados em NUVEM."
    
    # Check for destructive commands on remote
    IS_DESTRUCTIVE=false
    for cmd in "${DESTRUCTIVE_COMMANDS[@]}"; do
        if [[ "$COMMAND" == "$cmd" ]]; then
            IS_DESTRUCTIVE=true
            break
        fi
    done

    if [ "$IS_DESTRUCTIVE" = true ] && [ "$FORCE_REMOTE" = false ]; then
        echo ""
        echo -e "${RED}ERRO: Operações destrutivas remotas estão bloqueadas por segurança.${NC}"
        echo -e "Para prosseguir, você DEVE adicionar a flag ${YELLOW}--force-remote${RED} ao comando.${NC}"
        echo ""
        exit 1
    fi

    echo ""
    echo -e "${MAGENTA}Confirmação de Segurança Requerida!${NC}"
    echo -e "Para confirmar que deseja atuar em ${YELLOW}${TARGET_ENV}${NC},"
    echo -e "digite o ID do projeto (${CYAN}${PROJECT_REF}${NC}) ou 'confirmar-remoto':"
    read -p "> " confirm
    
    if [[ "$confirm" != "$PROJECT_REF" ]] && [[ "$confirm" != "confirmar-remoto" ]]; then
        echo -e "${YELLOW}Operação abortada. Confirmação inválida.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Autorizado. Executando...${NC}"
    echo ""
fi

# 5. Command Execution
# Ensure local commands always target the local instance
case "$COMMAND" in
    "db reset")
        npx supabase db reset $SHIFT_ARGS
        ;;
    "db push")
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
