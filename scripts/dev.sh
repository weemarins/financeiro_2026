#!/bin/bash

# Script para iniciar o desenvolvimento localmente

echo "🚀 Iniciando ambiente de desenvolvimento..."
echo ""

# Cores
BLUE='\033[0;34m'
NC='\033[0m'

# Função para iniciar os serviços
start_backend() {
    echo -e "${BLUE}Terminal 1: Iniciando Backend${NC}"
    echo "Executando: cd backend && npm run dev"
    echo ""
    cd backend
    npm run dev
}

start_frontend() {
    echo -e "${BLUE}Terminal 2: Iniciando Frontend${NC}"
    echo "Executando: cd frontend && npm run dev"
    echo ""
    cd frontend
    npm run dev
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Execute este script da raiz do projeto"
    exit 1
fi

# Se houver apenas um argumento e for "backend" ou "frontend"
if [ "$1" == "backend" ]; then
    start_backend
elif [ "$1" == "frontend" ]; then
    start_frontend
else
    echo "Uso: ./scripts/dev.sh [backend|frontend]"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/dev.sh backend    # Iniciar apenas backend"
    echo "  ./scripts/dev.sh frontend   # Iniciar apenas frontend"
    echo ""
    echo "Ou abra dois terminais e execute:"
    echo "  Terminal 1: ./scripts/dev.sh backend"
    echo "  Terminal 2: ./scripts/dev.sh frontend"
fi
