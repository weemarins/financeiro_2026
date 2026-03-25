#!/bin/bash

# Script de setup para o sistema de gerenciamento financeiro familiar

set -e

echo "======================================"
echo "🚀 Setup - Sistema Financeiro Familiar"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir sucesso
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Função para imprimir informação
info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Função para imprimir erro
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar Node.js
info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Por favor, instale Node.js v18 ou superior."
    exit 1
fi
NODE_VERSION=$(node -v)
success "Node.js $NODE_VERSION encontrado"

# Criar arquivo .env do backend
info "Configurando backend..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    
    # Gerar JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/seu_secret_jwt_super_seguro_aqui_mude_em_producao/$JWT_SECRET/" backend/.env
    
    success "Arquivo .env do backend criado com JWT_SECRET seguro"
else
    success "Arquivo .env do backend já existe"
fi

# Criar arquivo .env do frontend
info "Configurando frontend..."
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    success "Arquivo .env do frontend criado"
else
    success "Arquivo .env do frontend já existe"
fi

# Instalar dependências do backend
info "Instalando dependências do backend..."
cd backend
npm install
success "Dependências do backend instaladas"
cd ..

# Instalar dependências do frontend
info "Instalando dependências do frontend..."
cd frontend
npm install
success "Dependências do frontend instaladas"
cd ..

# Criar diretório de dados
info "Criando diretório de dados..."
mkdir -p data
success "Diretório de dados criado"

# Inicializar banco de dados
info "Inicializando banco de dados..."
cd backend
npm run db:init

if [ -z "$SEED_USER_PASSWORD" ]; then
    SEED_USER_PASSWORD=$(openssl rand -base64 12)
fi

if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="admin@local.dev"
fi

if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 16)
fi

SEED_USER_PASSWORD="$SEED_USER_PASSWORD" npm run db:seed
ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run db:create-admin
success "Banco de dados inicializado com dados de exemplo"
cd ..

echo ""
echo "======================================"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Para rodar localmente em desenvolvimento:"
echo "   - Terminal 1 (Backend): cd backend && npm run dev"
echo "   - Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "2. Para rodar com Docker:"
echo "   - docker-compose -f docker/docker-compose.yml up -d"
echo ""
echo "3. Usuário admin criado:"
echo "   Email: $ADMIN_EMAIL"
echo "   Senha: $ADMIN_PASSWORD"
echo ""
echo "4. Usuários de exemplo do seed:"
echo "   Emails: joao@example.com e maria@example.com"
echo "   Senha: $SEED_USER_PASSWORD"
echo ""
echo "5. URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:5000"
echo "   API: http://localhost:5000/api"
echo ""
