#!/bin/bash

# Script de validação da estrutura do projeto

echo "🔍 Validando estrutura do projeto..."
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }

total_checks=0
passed_checks=0

check_file() {
    total_checks=$((total_checks + 1))
    if [ -f "$1" ]; then
        success "$1"
        passed_checks=$((passed_checks + 1))
    else
        error "$1 (FALTANDO)"
    fi
}

check_dir() {
    total_checks=$((total_checks + 1))
    if [ -d "$1" ]; then
        success "$1/"
        passed_checks=$((passed_checks + 1))
    else
        error "$1/ (FALTANDO)"
    fi
}

echo "📁 Diretórios:"
check_dir "backend"
check_dir "backend/src"
check_dir "backend/src/controllers"
check_dir "backend/src/services"
check_dir "backend/src/routes"
check_dir "backend/src/middleware"
check_dir "backend/src/database"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/src/pages"
check_dir "frontend/src/components"
check_dir "frontend/src/services"
check_dir "frontend/src/contexts"
check_dir "docker"
check_dir "scripts"

echo ""
echo "📄 Arquivos Backend:"
check_file "backend/package.json"
check_file "backend/.env.example"
check_file "backend/.gitignore"
check_file "backend/src/index.js"
check_file "backend/src/database/connection.js"
check_file "backend/src/database/schema.sql"
check_file "backend/src/database/init.js"
check_file "backend/src/database/seed.js"
check_file "backend/src/controllers/authController.js"
check_file "backend/src/controllers/dashboardController.js"
check_file "backend/src/controllers/transactionController.js"
check_file "backend/src/controllers/creditCardController.js"
check_file "backend/src/controllers/investmentController.js"
check_file "backend/src/controllers/goalsController.js"
check_file "backend/src/services/authService.js"
check_file "backend/src/services/dashboardService.js"
check_file "backend/src/services/transactionService.js"
check_file "backend/src/services/creditCardService.js"
check_file "backend/src/services/investmentService.js"
check_file "backend/src/services/goalsService.js"
check_file "backend/src/routes/authRoutes.js"
check_file "backend/src/routes/dashboardRoutes.js"
check_file "backend/src/routes/transactionRoutes.js"
check_file "backend/src/routes/creditCardRoutes.js"
check_file "backend/src/routes/investmentRoutes.js"
check_file "backend/src/routes/goalsRoutes.js"
check_file "backend/src/middleware/jwt.js"
check_file "backend/src/middleware/auth.js"
check_file "backend/src/middleware/rateLimiter.js"
check_file "backend/src/middleware/errorHandler.js"

echo ""
echo "📄 Arquivos Frontend:"
check_file "frontend/package.json"
check_file "frontend/.env.example"
check_file "frontend/.gitignore"
check_file "frontend/vite.config.js"
check_file "frontend/index.html"
check_file "frontend/src/main.jsx"
check_file "frontend/src/App.jsx"
check_file "frontend/src/index.css"
check_file "frontend/src/services/api.js"
check_file "frontend/src/services/index.js"
check_file "frontend/src/contexts/AuthContext.jsx"
check_file "frontend/src/components/Layout.jsx"
check_file "frontend/src/components/PrivateRoute.jsx"
check_file "frontend/src/pages/LoginPage.jsx"
check_file "frontend/src/pages/DashboardPage.jsx"
check_file "frontend/src/pages/index.jsx"

echo ""
echo "📄 Arquivos Docker:"
check_file "docker/Dockerfile.backend"
check_file "docker/Dockerfile.frontend"
check_file "docker/docker-compose.yml"
check_file "docker-compose.yml"

echo ""
echo "📄 Scripts:"
check_file "scripts/setup.sh"
check_file "scripts/dev.sh"
check_file "scripts/deploy-aws.sh"
check_file "scripts/backup.sh"

echo ""
echo "📄 Arquivos de Configuração:"
check_file ".env.docker"
check_file ".gitignore"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "FEATURES.md"
check_file "STRUCTURE.sh"

echo ""
echo "======================================"
echo "📊 Resultado da Validação"
echo "======================================"
echo "Verificações: $passed_checks/$total_checks"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}✓ Todos os arquivos estão presentes!${NC}"
    echo ""
    echo "🚀 Próximas ações:"
    echo "1. chmod +x scripts/*.sh"
    echo "2. ./scripts/setup.sh"
    echo ""
else
    MISSING=$((total_checks - passed_checks))
    echo -e "${RED}✗ $MISSING arquivo(s) faltando${NC}"
    echo ""
fi

echo "======================================"
