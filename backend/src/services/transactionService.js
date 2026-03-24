import { run, get, all } from '../database/connection.js';

// RECEITAS

export async function createIncome(familyId, userId, categoryId, description, amount, date, isRecurring = false, recurringType = null) {
  const result = await run(
    `INSERT INTO incomes (family_id, user_id, category_id, description, amount, date, is_recurring, recurring_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, categoryId, description, amount, date, isRecurring ? 1 : 0, recurringType]
  );
  return result.id;
}

export async function getFamilyIncomes(familyId, startDate, endDate) {
  return all(
    `SELECT i.*, c.name as category_name, u.name as user_name 
     FROM incomes i 
     JOIN categories c ON c.id = i.category_id 
     JOIN users u ON u.id = i.user_id
     WHERE i.family_id = ? AND i.date BETWEEN ? AND ?
     ORDER BY i.date DESC`,
    [familyId, startDate, endDate]
  );
}

export async function updateIncome(incomeId, updates) {
  const { categoryId, description, amount, date, isRecurring, recurringType } = updates;
  const result = await run(
    `UPDATE incomes SET category_id = ?, description = ?, amount = ?, date = ?, is_recurring = ?, recurring_type = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [categoryId, description, amount, date, isRecurring ? 1 : 0, recurringType, incomeId]
  );
  return result.changes > 0;
}

export async function deleteIncome(incomeId) {
  const result = await run('DELETE FROM incomes WHERE id = ?', [incomeId]);
  return result.changes > 0;
}

// DESPESAS

export async function createExpense(familyId, userId, categoryId, description, amount, date, paymentMethod = 'cash', isRecurring = false, recurringType = null, installments = 1) {
  const result = await run(
    `INSERT INTO expenses (family_id, user_id, category_id, description, amount, date, payment_method, is_recurring, recurring_type, installments) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, categoryId, description, amount, date, paymentMethod, isRecurring ? 1 : 0, recurringType, installments]
  );
  return result.id;
}

export async function getFamilyExpenses(familyId, startDate, endDate) {
  return all(
    `SELECT e.*, c.name as category_name, u.name as user_name 
     FROM expenses e 
     JOIN categories c ON c.id = e.category_id 
     JOIN users u ON u.id = e.user_id
     WHERE e.family_id = ? AND e.date BETWEEN ? AND ?
     ORDER BY e.date DESC`,
    [familyId, startDate, endDate]
  );
}

export async function updateExpense(expenseId, updates) {
  const { categoryId, description, amount, date, paymentMethod, isRecurring, recurringType, installments } = updates;
  const result = await run(
    `UPDATE expenses SET category_id = ?, description = ?, amount = ?, date = ?, payment_method = ?, is_recurring = ?, recurring_type = ?, installments = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [categoryId, description, amount, date, paymentMethod, isRecurring ? 1 : 0, recurringType, installments, expenseId]
  );
  return result.changes > 0;
}

export async function deleteExpense(expenseId) {
  const result = await run('DELETE FROM expenses WHERE id = ?', [expenseId]);
  return result.changes > 0;
}

// CATEGORIAS

export async function createCategory(familyId, name, type, color = '#3b82f6', icon = 'folder') {
  const result = await run(
    'INSERT INTO categories (family_id, name, type, color, icon, is_system) VALUES (?, ?, ?, ?, ?, 0)',
    [familyId, name, type, color, icon]
  );
  return result.id;
}

export async function getFamilyCategories(familyId, type = null) {
  if (type) {
    return all(
      'SELECT * FROM categories WHERE family_id = ? AND type = ? ORDER BY name',
      [familyId, type]
    );
  }
  return all(
    'SELECT * FROM categories WHERE family_id = ? ORDER BY type, name',
    [familyId]
  );
}

export async function updateCategory(categoryId, updates) {
  const { name, color, icon } = updates;
  const result = await run(
    'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND is_system = 0',
    [name, color, icon, categoryId]
  );
  return result.changes > 0;
}

export async function deleteCategory(categoryId) {
  const result = await run(
    'DELETE FROM categories WHERE id = ? AND is_system = 0',
    [categoryId]
  );
  return result.changes > 0;
}
