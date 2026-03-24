# 🎯 Guia de Primeiros Passos

Bem-vindo ao **Sistema de Gerenciamento Financeiro Familiar**! Este guia irá ajudá-lo a começar em 5 minutos.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (vem com Node.js)
- **Git** (opcional, para versão control)
- **Docker & Docker Compose** (opcional, para ambiente containerizado)

Verificar instalação:
```bash
node -v      # Deve retornar algo como v18.0.0+
npm -v       # Deve retornar algo como 9.0.0+
docker -v    # (opcional) Deve retornar versão do Docker
```

## 🚀 3 Maneiras de Começar

### ✨ Opção 1: Mais Rápido (Desenvolvimento Local)

**Passo 1**: Abra o terminal na pasta do projeto e execute:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

O script irá:
- ✅ Verificar Node.js
- ✅ Instalar dependências
- ✅ Criar arquivo .env com JWT_SECRET seguro
- ✅ Inicializar banco de dados
- ✅ Crear dados de teste

**Passo 2**: Abra **dois terminais**:

Terminal 1 - Backend (API):
```bash
cd backend
npm run dev
```
Você deve ver: `✅ Server is running at http://localhost:5000`

Terminal 2 - Frontend (Interface):
```bash
cd frontend
npm run dev
```
Você deve ver: `VITE v5.0.0 ready in XXX ms`

**Passo 3**: Acesse a aplicação:
- Abra http://localhost:5173 no navegador
- Use as credenciais de teste:
  - Email: `joao@example.com`
  - Senha: `senha123`

---

### 🐳 Opção 2: Com Docker (Recomendado para Produção)

**Passo 1**: Prepare o arquivo de configuração:

```bash
cp .env.docker .env
```

(Opcional) Edite o `.env` para personalizar portas ou JWT_SECRET

**Passo 2**: Inicie os contêineres:

```bash
docker-compose up -d
```

Você deve ver:
```
✓ financeiro-backend is running
✓ financeiro-frontend is running
```

**Passo 3**: Aguarde ~30 segundos e acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api

Credenciais:
- Email: `joao@example.com`
- Senha: `senha123`

---

### ☁️ Opção 3: Deploy na AWS (Ubuntu EC2)

**Passo 1**: Conecte via SSH à sua EC2:

```bash
ssh -i sua-chave.pem ubuntu@seu-ip-publico
```

**Passo 2**: Clone o repositório:

```bash
git clone seu-repositorio.git financeiro
cd financeiro
```

**Passo 3**: Execute o script de setup:

```bash
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

O script fará:
- ✅ Atualizar sistema
- ✅ Instalar Node.js
- ✅ Instalar Docker
- ✅ Instalar Docker Compose

**Passo 4**: Configure o banco:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edite os arquivos se necessário
nano backend/.env
```

**Passo 5**: Inicie:

```bash
docker-compose up -d
```

**Passo 6**: Acesse:
- Frontend: `http://seu-ip-publico:5173`
- Backend: `http://seu-ip-publico:5000`

---

## 🔑 Credenciais de Teste

```
Email: joao@example.com
Senha: senha123
```

Outra conta de teste:
```
Email: maria@example.com
Senha: senha123
```

---

## 📱 Usando a Aplicação

### Dashboard
Aqui você vê:
- Saldo atual
- Receitas e despesas do mês
- Gráficos por categoria
- Status dos cartões

### Transações
Seção em desenvolvimento para adicionar/editar receitas e despesas

### Cartões
Seção em desenvolvimento para gerenciar seus cartões

### Investimentos
Seção em desenvolvimento para acompanhar investimentos

### Metas
Seção em desenvolvimento para criar metas financeiras

---

## 🐛 Problemas Comuns

### "Porta já está em uso"
Mudança de porta no arquivo `.env`:
```env
PORT=5001  # Em vez de 5000
```

### "npm: comando não encontrado"
Node.js não está instalado. Instale de: https://nodejs.org/

### "Docker não encontrado"
Docker não está instalado. Siga: https://docs.docker.com/get-docker/

### Banco de dados vazio
```bash
cd backend
npm run db:init      # Inicializar schema
npm run db:seed      # Adicionar dados
npm run dev          # Reiniciar
```

### Erro de CORS
Verifique a URL no arquivo `.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 📚 Documentação Adicional

- **README.md**: Documentação completa do projeto
- **QUICKSTART.md**: Início rápido simplificado
- **FEATURES.md**: Lista de funcionalidades implementadas
- **STRUCTURE.sh**: Visualizar estrutura do projeto

---

## 🔧 Comandos Úteis

### Backend
```bash
npm run dev           # Iniciar em desenvolvimento
npm run start         # Iniciar em produção
npm run db:init       # Criar schema do banco
npm run db:seed       # Adicionar dados de teste
```

### Frontend
```bash
npm run dev           # Iniciar em desenvolvimento
npm run build         # Fazer build para produção
npm run preview       # Visualizar build
```

### Docker
```bash
docker-compose up -d        # Iniciar em background
docker-compose down         # Parar
docker-compose logs -f      # Ver logs
docker-compose restart      # Reiniciar
```

### Backup
```bash
./scripts/backup.sh   # Fazer backup do banco
```

---

## 🎓 Estrutura do Código

```
Backend (Node.js/Express)
├── Controllers: Recebem requisições HTTP
├── Services: Contém lógica de negócio
├── Routes: Definem rotas da API
├── Middleware: Autenticação, validação
└── Database: Schema e conexão SQLite

Frontend (React/Vite)
├── Pages: Páginas principais (Login, Dashboard, etc)
├── Components: Componentes reutilizáveis
├── Services: Cliente API (Axios)
├── Contexts: Estado global (Auth)
└── Styles: Tailwind CSS
```

---

## ✋ Próximos Passos

1. **Explore o código**: Veja como os componentes funcionam
2. **Customização**: Adapte cores, textos e funcionalidades
3. **Adicione features**: Implemente novas funcionalidades
4. **Deploy**: Coloque em produção na AWS
5. **Backup**: Configure rotina de backup

---

## 📞 Suporte

Dúvidas? Confira:
- Logs do servidor: `npm run dev` mostra todos os erros
- Browser DevTools: F12 para ver erros do frontend
- Docker logs: `docker-compose logs backend`

---

## 🎉 Parabéns!

Você agora tem um sistema financeiro familiar completo! 

**Aproveite! 💰**

---

**Dica**: Salve este arquivo em seus favoritos para consultas futuras!
