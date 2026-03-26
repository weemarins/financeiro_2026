import jwt from 'jsonwebtoken';

const FALLBACK_JWT_SECRET = 'financeiro_local_fallback_secret_change_me';
let hasWarnedAboutJwtSecret = false;

function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (!hasWarnedAboutJwtSecret) {
    hasWarnedAboutJwtSecret = true;
    console.warn('⚠️ JWT_SECRET não configurado. Usando segredo de fallback temporário.');
  }

  return FALLBACK_JWT_SECRET;
}

export function createAccessToken(userId, familyId, role) {
  return jwt.sign(
    { userId, familyId, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}
