import { get } from '../database/connection.js';
import { verifyAccessToken } from './jwt.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const dbUser = await get(
      `SELECT id, family_id, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.userId]
    );

    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      userId: dbUser.id,
      familyId: dbUser.family_id,
      role: dbUser.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to validate user session' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
