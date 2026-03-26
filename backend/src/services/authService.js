import bcrypt from 'bcryptjs';
import { run, get, all } from '../database/connection.js';
import { createAccessToken } from '../middleware/jwt.js';

export async function registerUser(familyId, name, email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Verificar se email já existe
  const existingUser = await get(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário
  const result = await run(
    'INSERT INTO users (family_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [familyId, name, normalizedEmail, hashedPassword, 'member']
  );

  return result.id;
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Buscar usuário
  const user = await get(
    'SELECT id, family_id, name, email, role, password FROM users WHERE email = ? AND is_active = 1',
    [normalizedEmail]
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
  const token = createAccessToken(user.id, user.family_id, user.role);

  return {
    token,
    user: {
      id: user.id,
      family_id: user.family_id,
      name: user.name,
      email: user.email,
      role: user.role
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

export async function updateUser(userId, updates, familyId) {
  const currentUser = await get(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ? AND family_id = ?',
    [userId, familyId]
  );

  if (!currentUser) {
    throw new Error('User not found');
  }

  const {
    name = currentUser.name,
    email = currentUser.email,
    role = currentUser.role,
    is_active = currentUser.is_active
  } = updates;

  const result = await run(
    'UPDATE users SET name = ?, email = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND family_id = ?',
    [name, email, role, is_active ? 1 : 0, userId, familyId]
  );

  return result.changes > 0;
}

export async function createFamilyUser(familyId, name, email, password, role = 'member') {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await run(
    'INSERT INTO users (family_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [familyId, name, normalizedEmail, hashedPassword, role]
  );

  return result.id;
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

export async function deleteFamilyUser(userId, familyId, requesterId) {
  const targetUser = await get(
    'SELECT id, role FROM users WHERE id = ? AND family_id = ?',
    [userId, familyId]
  );

  if (!targetUser) {
    throw new Error('User not found');
  }

  if (Number(userId) === Number(requesterId)) {
    throw new Error('You cannot delete your own user');
  }

  if (targetUser.role === 'admin') {
    const remainingAdmins = await get(
      'SELECT COUNT(*) AS total FROM users WHERE family_id = ? AND role = ? AND is_active = 1 AND id != ?',
      [familyId, 'admin', userId]
    );

    if (!remainingAdmins || Number(remainingAdmins.total) === 0) {
      throw new Error('A family must have at least one admin');
    }
  }

  const result = await run(
    'DELETE FROM users WHERE id = ? AND family_id = ?',
    [userId, familyId]
  );

  return result.changes > 0;
}
