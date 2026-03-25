import rateLimit from 'express-rate-limit';

function passThroughLimiter(_req, _res, next) {
  next();
}

function createEnvAwareLimiter(config, skipInEnv) {
  if (process.env.NODE_ENV === skipInEnv) {
    return passThroughLimiter;
  }

  return rateLimit(config);
}

// Rate limit para login (máximo 5 tentativas em 15 minutos)
export const loginLimiter = createEnvAwareLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
// Rate limit geral para API (máximo 100 requisições em 15 minutos)
export const apiLimiter = createEnvAwareLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
