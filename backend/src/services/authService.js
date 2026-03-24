import bcrypt from 'bcryptjs';
import { run, get, all } from '../database/connection.js';
import { createAccessToken } from '../middleware/jwt.js';

export async function registerUser(familyId, name, email, password) {
  // Verificar se email já existe
  const existingUser = await get(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário
  const result = await run(
    'INSERT INTO users (family_id, name, email, password) VALUES (?, ?, ?, ?)',
    [familyId, name, email, hashedPassword]
  );

  return result.id;
}

export async function loginUser(email, password) {
  // Buscar usuário
  const user = await get(
    'SELECT id, family_id, name, email, password FROM users WHERE email = ? AND is_active = 1',
    [email]
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verificar senha
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Gerar token
  const token = createAccessToken(user.id, user.family_id);

  return {
    token,
    user: {
      id: user.id,
      family_id: user.family_id,
      name: user.name,
      email: user.email
    }
  };
}

export async function getUserById(userId) {
  const user = await get(
    'SELECT id, family_id, name, email, role, is_active, created_at FROM users WHERE id = ?',
    [userId]
  );

  return user;
}

export async function getFamilyUsers(familyId) {
  const users = await all(
    'SELECT id, name, email, role, is_active, created_at FROM users WHERE family_id = ?',
    [familyId]
  );

  return users;
}

export async function updateUser(userId, updates) {
  const { name, email } = updates;

  const result = await run(
    'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name || (await get('SELECT name FROM users WHERE id = ?', [userId])).name, email, userId]
  );

  return result.changes > 0;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await get(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await run(
    'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [hashedPassword, userId]
  );

  return true;
}
