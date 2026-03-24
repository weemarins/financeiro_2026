# Sistema de Gerenciamento Financeiro Familiar - Guia de Setup

## ⚡ Início Rápido

### Opção 1: Desenvolvimento Local (Recomendado para desenvolvimento)

```bash
# 1. Setup inicial (só precisa rodar uma vez)
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Em dois terminais diferentes:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Acesse: http://localhost:5173
```

### Opção 2: Docker (Recomendado para produção/homolog)

```bash
# 1. Configure as variáveis
cp .env.docker .env

# 2. Inicie
docker-compose up -d

# Acesse: http://localhost:5173
# API: http://localhost:5000
```

### Opção 3: Deploy AWS

```bash
# Em uma EC2 Ubuntu:
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh

# Depois configure o .env e rode:
docker-compose up -d
```

## 🔑 Credenciais de Teste

```
Email: joao@example.com
Senha: senha123
```

## 📱 Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🆘 Troubleshooting

### Porta já em uso
```bash
# Kill process na porta:
lsof -i :5000       # Encontra processo na porta 5000
kill -9 <PID>       # Mata o processo

# Ou mude as portas no .env
```

### Banco de dados não inicializa
```bash
rm -rf data/        # Remove dados antigos
npm run db:init     # Reinicializa
npm run db:seed     # Adiciona dados de teste
```

### Docker não conecta
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Reinicia
```

## 📚 Documentação

Veja [README.md](./README.md) para documentação completa.
