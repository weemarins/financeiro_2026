import jwt from 'jsonwebtoken';

export function createAccessToken(userId, familyId, role) {
  return jwt.sign(
    { userId, familyId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
