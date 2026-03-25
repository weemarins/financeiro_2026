#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { get, run } from './connection.js';

dotenv.config();

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

async function ensureFamily(familyName) {
  const existingFamily = await get('SELECT id FROM families WHERE name = ? LIMIT 1', [familyName]);
  if (existingFamily) {
    return existingFamily.id;
  }

  const family = await run(
    'INSERT INTO families (name, description) VALUES (?, ?)',
    [familyName, 'Família administrativa']
  );
  return family.id;
}

async function createOrUpdateAdminUser() {
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador';
  const email = getRequiredEnv('ADMIN_EMAIL');
  const password = getRequiredEnv('ADMIN_PASSWORD');
  const familyName = process.env.ADMIN_FAMILY_NAME?.trim() || 'Administração';

  const hashedPassword = await bcrypt.hash(password, 10);
  const familyId = await ensureFamily(familyName);

  const existingUser = await get(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingUser) {
    await run(
      `UPDATE users
       SET family_id = ?, name = ?, password = ?, role = 'admin', is_active = 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [familyId, name, hashedPassword, existingUser.id]
    );
    console.log(`✓ Admin atualizado com sucesso (user_id=${existingUser.id})`);
    return;
  }

  const created = await run(
    `INSERT INTO users (family_id, name, email, password, role, is_active)
     VALUES (?, ?, ?, ?, 'admin', 1)`,
    [familyId, name, email, hashedPassword]
  );

  console.log(`✓ Admin criado com sucesso (user_id=${created.id})`);
}

createOrUpdateAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao criar admin:', error.message);
    process.exit(1);
  });
