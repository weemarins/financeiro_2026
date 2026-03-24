import rateLimit from 'express-rate-limit';

// Rate limit para login (máximo 5 tentativas em 15 minutos)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skip: process.env.NODE_ENV === 'development'
});

// Rate limit geral para API (máximo 100 requisições em 15 minutos)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  skip: process.env.NODE_ENV === 'test'
});
