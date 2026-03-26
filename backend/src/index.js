import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/connection.js';
import { authenticateToken } from './middleware/auth.js';
import { apiLimiter, loginLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Rotas
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import creditCardRoutes from './routes/creditCardRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import goalsRoutes from './routes/goalsRoutes.js';

// Configurar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 5000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;
const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';

// Inicializar Express
const app = express();
const TRUST_PROXY = process.env.TRUST_PROXY;

if (TRUST_PROXY) {
  const normalizedTrustProxy = TRUST_PROXY.toLowerCase();

  if (normalizedTrustProxy === 'true') {
    app.set('trust proxy', true);
  } else if (normalizedTrustProxy === 'false') {
    app.set('trust proxy', false);
  } else if (!Number.isNaN(Number(TRUST_PROXY))) {
    app.set('trust proxy', Number(TRUST_PROXY));
  } else {
    app.set('trust proxy', TRUST_PROXY);
  }
} else if (process.env.NODE_ENV === 'production') {
  // Em produção usamos proxy reverso (nginx), então confiamos no primeiro hop.
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/', apiLimiter);

// Rotas públicas
app.use('/api/auth', authRoutes);

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de autenticação para rotas protegidas
app.use('/api/dashboard', authenticateToken);
app.use('/api/transactions', authenticateToken);
app.use('/api/credit-cards', authenticateToken);
app.use('/api/investments', authenticateToken);
app.use('/api/goals', authenticateToken);

// Rotas protegidas
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalsRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
async function startServer() {
  try {
    await initializeDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running at ${API_URL}`);
      console.log(`📚 API endpoints available at ${API_URL}/api`);
      console.log(`💚 Health check: ${API_URL}/health`);
      console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
