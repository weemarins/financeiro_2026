import { verifyAccessToken } from './jwt.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    // Para agora, estamos apenas verificando se o usuário está autenticado
    // Você pode expandir isso para verificar roles específicas se necessário
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
}
