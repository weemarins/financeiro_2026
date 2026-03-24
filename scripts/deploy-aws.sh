#!/bin/bash

# Script para deploy na AWS EC2 (Amazon Linux 2023)

set -e

echo "======================================"
echo "🚀 Deploy na AWS EC2 (Amazon Linux 2023)"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Atualizar sistema
info "Atualizando sistema operacional..."
sudo dnf update -y
success "Sistema atualizado"

# Instalar Node.js
info "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    sudo dnf install -y nodejs
    success "Node.js instalado"
else
    success "Node.js já está instalado: $(node -v)"
fi

# Instalar Docker
info "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    newgrp docker
    success "Docker instalado"
else
    success "Docker já está instalado: $(docker --version)"
fi

# Instalar Docker Compose
info "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose instalado"
else
    success "Docker Compose já está instalado: $(docker-compose --version)"
fi

# Instalar Git (se necessário)
info "Verificando Git..."
if ! command -v git &> /dev/null; then
    sudo dnf install -y git
    success "Git instalado"
else
    success "Git já está instalado: $(git --version)"
fi

# Clonar repositório (ajuste conforme necessário)
info "Preparando diretório da aplicação..."
if [ ! -d "financeiro" ]; then
    info "Você pode clonar seu repositório Git aqui:"
    info "  git clone YOUR_REPO_URL financeiro"
    info "  cd financeiro"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Instalação de dependências concluída!${NC}"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Clone o repositório:"
echo "   git clone YOUR_REPO_URL financeiro"
echo "   cd financeiro"
echo ""
echo "2. Configure as variáveis de ambiente:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.example frontend/.env"
echo "   # Edite os arquivos .env com os valores corretos"
echo ""
echo "3. Inicie os contêineres Docker:"
echo "   docker-compose -f docker/docker-compose.yml up -d"
echo ""
echo "4. Verifique se está rodando:"
echo "   curl http://localhost:5000/health"
echo ""
echo "5. Acesse a aplicação:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):5173"
echo "   Backend: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
