<<<<<<< HEAD
# 💰 Sistema de Gerenciamento Financeiro Familiar

Um sistema completo de gestão financeira para famílias, desenvolvido com Node.js, Express, React e Vite. Inclui funcionalidades avançadas como gestão de cartões de crédito, investimentos, metas financeiras e muito mais.

## 📋 Características Principais

### 1. **Dashboard Inteligente**
- Visão geral financeira em tempo real
- Saldo atual, receitas e despesas
- Gráficos de distribuição por categoria
- Status dos cartões de crédito
- Acompanhamento de investimentos

### 2. **Gestão de Transações**
- Registro de receitas e despesas
- Categorias personalizáveis
- Suporte a transações recorrentes
- Parcelamento de despesas
- Histórico completo

### 3. **Cartões de Crédito**
- Cadastro de múltiplos cartões
- Monitore limite disponível
- Rastreamento de faturas
- Parcelamento de compras
- Histórico de transações

### 4. **Investimentos**
- Registro de investimentos (renda fixa/variável)
- Acompanhamento de aporte
- Cálculo automático de lucro/prejuízo
- Histórico de contribuições

### 5. **Metas Financeiras**
- Criação de metas personalizadas
- Acompanhamento de progresso
- Reserva de emergência automática
- Notificações de metas atingidas

### 6. **Segurança**
- Autenticação com JWT
- Criptografia de senhas com bcrypt
- Proteção de rotas
- Rate limiting
- CORS configurado
- Isolamento de dados por família

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** v18+
- **Express** 4.18+
- **SQLite3** 5.1+ (banco de dados local)
- **bcryptjs** (criptografia)
- **jsonwebtoken** (autenticação JWT)
- **cors** (CORS handling)
- **express-rate-limit** (rate limiting)
- **morgan** (logging)

### Frontend
- **React** 18.2+
- **Vite** 5.0+ (build tool)
- **React Router** 6.20+
- **Axios** (HTTP client)
- **Recharts** (gráficos)
- **Tailwind CSS** (styling)
- **Lucide React** (ícones)

### DevOps
- **Docker** & **Docker Compose**
- **Ubuntu** Linux (para AWS)
- Bash scripting

## 📦 Estrutura do Projeto

```
financeiro/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Lógica de negócio
│   │   ├── routes/            # Rotas da API
│   │   ├── middleware/        # Autenticação, erros, rate limit
│   │   ├── database/          # Schema, conexão
│   │   └── index.js           # Server principal
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # App React + Vite
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── services/         # Cliente API
│   │   ├── contexts/         # Auth context
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── docker/
│   ├── Dockerfile.backend    # Docker para backend
│   ├── Dockerfile.frontend   # Docker para frontend
│   └── docker-compose.yml    # Orquestração
│
├── scripts/
│   ├── setup.sh             # Setup inicial
│   ├── dev.sh               # Dev local
│   ├── deploy-aws.sh        # Deploy AWS
│   └── backup.sh            # Backup database
│
├── .env.docker              # Env para Docker
├── data/                    # Dados do SQLite
└── README.md
```

## 🚀 Guia de Início Rápido

### Pré-requisitos
- Node.js v18+ 
- npm ou yarn
- Docker & Docker Compose (opcional, para containerização)
- Git

### Instalação Local (Desenvolvimento)

#### 1. Clone e Setup
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeiro.git
cd financeiro

# Execute o script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### 2. Configurar Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/financeiro.db
JWT_SECRET=sua_chave_super_segura_aqui
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

#### 3. Iniciar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### Criação de usuário admin (sem credenciais hardcoded)
```bash
cd backend
ADMIN_EMAIL="admin@local.dev" \
ADMIN_PASSWORD="<senha-forte>" \
npm run db:create-admin
```

## 🐳 Deploy com Docker

### Usando Docker Compose (Recomendado)

#### 1. Configure as variáveis
```bash
cp .env.docker .env
# Edite o arquivo .env com suas configurações
```

#### 2. Inicie os contêineres
```bash
docker-compose -f docker/docker-compose.yml up -d
```

#### 3. Acesse a aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

#### 4. Parar os contêineres
```bash
docker-compose -f docker/docker-compose.yml down
```

## 🌐 Deploy na AWS (Ubuntu EC2)

### Pré-requisitos
- EC2 instance com Ubuntu 22.04 LTS
- Acesso via SSH
- Segurity Group configurado (portas 5000, 5173, 22)

### Passo 1: Conectar à EC2
```bash
ssh -i sua-chave.pem ubuntu@seu-instance-ip
```

### Passo 2: Execute o script de setup
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeiro.git
cd financeiro

# Execute o script de deploy
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

### Passo 3: Configure as variáveis
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edite os arquivos com as configurações finais
nano backend/.env
nano frontend/.env
```

### Passo 4: Inicie com Docker Compose
```bash
cp .env.docker .env
docker-compose -f docker/docker-compose.yml up -d
```

### Passo 5: Acesse a aplicação
```
Frontend: http://seu-instance-ip:5173
Backend:  http://seu-instance-ip:5000
```

## 📊 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar novo usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Obter perfil |
| PUT | `/api/auth/profile` | Atualizar perfil |
| POST | `/api/auth/change-password` | Trocar senha |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/dashboard` | Dashboard com período customizado |
| GET | `/api/dashboard/dashboard/monthly` | Dashboard mensal |

### Transações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/transactions/incomes` | Listar receitas |
| POST | `/api/transactions/incomes` | Criar receita |
| PUT | `/api/transactions/incomes/:id` | Atualizar receita |
| DELETE | `/api/transactions/incomes/:id` | Deletar receita |
| GET | `/api/transactions/expenses` | Listar despesas |
| POST | `/api/transactions/expenses` | Criar despesa |

### Cartões de Crédito
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/credit-cards/cards` | Listar cartões |
| POST | `/api/credit-cards/cards` | Criar cartão |
| GET | `/api/credit-cards/cards/:id` | Detalhes do cartão |

### Investimentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/investments/investments` | Listar investimentos |
| POST | `/api/investments/investments` | Criar investimento |
| POST | `/api/investments/investments/:id/contributions` | Adicionar aporte |

### Metas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/goals/goals` | Listar metas |
| POST | `/api/goals/goals` | Criar meta |
| GET | `/api/goals/emergency-fund` | Reserva de emergência |

## 🔐 Autenticação e Segurança

### JWT Token
Os tokens expiram em 7 dias (configurável). Envie o token no header:
```
Authorization: Bearer seu_token_aqui
```

### Proteção de Dados
- Senhas criptografadas com bcrypt (10 rounds)
- Isolamento de dados por família
- Rate limiting em endpoints de login
- CORS configurado para domínios específicos
- Proteção contra ataques comuns

## 📱 Incrementos de Funcionalidade

As seguintes funcionalidades estão estruturadas mas com UI em desenvolvimento:
- Edição completa de transações
- Relatórios em PDF/CSV
- Notificações e alertas
- Configurações de usuário
- Integração com APIs externas

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run start      # Iniciar servidor
npm run dev        # Iniciar em desenvolvimento
npm run db:init    # Inicializar banco de dados
npm run db:seed    # Adicionar dados de teste
```

### Frontend
```bash
npm run dev        # Iniciar servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
```

### Gerais
```bash
./scripts/setup.sh          # Setup inicial
./scripts/dev.sh backend    # Dev backend
./scripts/dev.sh frontend   # Dev frontend
./scripts/backup.sh         # Backup database
./scripts/deploy-aws.sh     # Setup AWS
```

## 🤝 Contribuições

Contribuições são bem-vindas! Faça um fork, crie uma branch e envie um pull request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 🎯 Roadmap

- [ ] Integração com plataformas de investimento
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] Aplicativo mobile
- [ ] Análise preditiva de gastos
- [ ] Integração com APIs de bancos
- [ ] Sistema de notificações via email
- [ ] Modo dark automático
- [ ] Suporte multi-idioma

---

**Desenvolvido com ❤️ para famílias que querem controlar suas finanças.**
=======
# financeiro_2026
>>>>>>> 273a2651af29f1d843b0bb57b0a737d32fca9f9e
