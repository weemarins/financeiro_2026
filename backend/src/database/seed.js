#!/usr/bin/env node

import { run } from './connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Criar família de exemplo
    const family = await run(
      'INSERT INTO families (name, description) VALUES (?, ?)',
      ['Família Silva', 'Família de exemplo para testes']
    );

    const familyId = family.id;
    console.log(`✓ Created family with ID: ${familyId}`);

    // Criar usuários de exemplo
    const hashedPassword = await bcrypt.hash('senha123', 10);

    const user1 = await run(
      'INSERT INTO users (family_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [familyId, 'João Silva', 'joao@example.com', hashedPassword, 'admin']
    );

    const user2 = await run(
      'INSERT INTO users (family_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [familyId, 'Maria Silva', 'maria@example.com', hashedPassword, 'member']
    );

    console.log(`✓ Created users: ${user1.id}, ${user2.id}`);

    // Criar categorias de sistema
    const systemCategories = [
      // Receitas
      { name: 'Salário', type: 'income', color: '#10b981', icon: 'briefcase' },
      { name: 'Renda Extra', type: 'income', color: '#06b6d4', icon: 'star' },
      { name: 'Investimentos', type: 'income', color: '#6366f1', icon: 'trending-up' },

      // Despesas
      { name: 'Moradia', type: 'expense', color: '#ef4444', icon: 'home' },
      { name: 'Alimentação', type: 'expense', color: '#f97316', icon: 'utensils' },
      { name: 'Transporte', type: 'expense', color: '#f59e0b', icon: 'car' },
      { name: 'Saúde', type: 'expense', color: '#ec4899', icon: 'heart' },
      { name: 'Educação', type: 'expense', color: '#8b5cf6', icon: 'book' },
      { name: 'Lazer', type: 'expense', color: '#14b8a6', icon: 'smile' },
      { name: 'Utilities', type: 'expense', color: '#6366f1', icon: 'zap' },
    ];

    for (const category of systemCategories) {
      await run(
        'INSERT INTO categories (family_id, name, type, color, icon, is_system) VALUES (?, ?, ?, ?, ?, 1)',
        [familyId, category.name, category.type, category.color, category.icon]
      );
    }

    console.log(`✓ Created ${systemCategories.length} system categories`);

    // Criar cartão de crédito de exemplo
    const card = await run(
      'INSERT INTO credit_cards (family_id, user_id, name, bank, limit, closing_day, due_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [familyId, user1.id, 'Cartão Principal', 'Banco do Brasil', 5000.00, 10, 20]
    );

    console.log(`✓ Created credit card with ID: ${card.id}`);

    // Criar dados financeiros de exemplo
    const categories = await new Promise((resolve, reject) => {
      const db = require('sqlite3').Database;
      const conn = new db(`./data/financeiro.db`);
      conn.all('SELECT id, name FROM categories WHERE family_id = ?', [familyId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
      conn.close();
    });

    // Receitas do mês atual
    const salaryCategory = categories.find(c => c.name === 'Salário');
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().split('T')[0].substring(0, 7);

    await run(
      'INSERT INTO incomes (family_id, user_id, category_id, description, amount, date, is_recurring, recurring_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [familyId, user1.id, salaryCategory.id, 'Salário mensal', 5000.00, `${currentMonth}-01`, 1, 'monthly']
    );

    // Despesas do mês
    const housingCategory = categories.find(c => c.name === 'Moradia');
    const foodCategory = categories.find(c => c.name === 'Alimentação');
    const transportCategory = categories.find(c => c.name === 'Transporte');

    await run(
      'INSERT INTO expenses (family_id, user_id, category_id, description, amount, date, is_recurring, recurring_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [familyId, user1.id, housingCategory.id, 'Aluguel do mês', 1500.00, `${currentMonth}-05`, 1, 'monthly']
    );

    await run(
      'INSERT INTO expenses (family_id, user_id, category_id, description, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
      [familyId, user2.id, foodCategory.id, 'Compras de supermercado', 450.00, `${currentMonth}-10`]
    );

    await run(
      'INSERT INTO expenses (family_id, user_id, category_id, description, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
      [familyId, user1.id, transportCategory.id, 'Uber/táxi', 120.00, `${currentMonth}-15`]
    );

    console.log('✓ Created sample transactions');

    // Criar metas financeiras
    const goal = await run(
      'INSERT INTO goals (family_id, user_id, name, description, goal_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [familyId, user1.id, 'Viagem para a praia', 'Viagem em família em dezembro', 5000.00, 1200.00, '2026-12-31']
    );

    console.log(`✓ Created goal with ID: ${goal.id}`);

    // Criar reserva de emergência
    await run(
      'INSERT INTO emergency_fund (family_id, target_amount, current_amount, monthly_suggestion) VALUES (?, ?, ?, ?)',
      [familyId, 15000.00, 3000.00, 500.00]
    );

    console.log('✓ Created emergency fund');

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
