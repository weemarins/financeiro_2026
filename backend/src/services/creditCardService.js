import { run, get, all } from '../database/connection.js';

export async function createCreditCard(familyId, userId, name, cardNumber, bank, limit, closingDay, dueDay) {
  const result = await run(
    `INSERT INTO credit_cards (family_id, user_id, name, card_number, bank, "limit", closing_day, due_day) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, name, cardNumber, bank, limit, closingDay, dueDay]
  );
  return result.id;
}

export async function getFamilyCreditCards(familyId) {
  return all(
    `SELECT cc.*, u.name as user_name 
     FROM credit_cards cc 
     JOIN users u ON u.id = cc.user_id
     WHERE cc.family_id = ? AND cc.is_active = 1
     ORDER BY cc.name`,
    [familyId]
  );
}

export async function getCreditCardDetails(cardId) {
  const card = await get(
    'SELECT * FROM credit_cards WHERE id = ?',
    [cardId]
  );

  if (!card) return null;

  const transactions = await all(
    `SELECT ct.*, e.description as expense_description 
     FROM card_transactions ct 
     LEFT JOIN expenses e ON e.id = ct.expense_id
     WHERE ct.credit_card_id = ?
     ORDER BY ct.date DESC`,
    [cardId]
  );

  const currentBill = await get(
    `SELECT SUM(amount) as total FROM card_transactions 
     WHERE credit_card_id = ? AND date >= ?`,
    [cardId, new Date().toISOString().split('T')[0]]
  );

  return {
    ...card,
    transactions,
    currentBill: currentBill?.total || 0,
    availableLimit: card.limit - (currentBill?.total || 0)
  };
}

export async function addCardTransaction(cardId, expenseId, description, amount, date, installments = 1) {
  const result = await run(
    `INSERT INTO card_transactions (credit_card_id, expense_id, description, amount, date, installments) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cardId, expenseId, description, amount, date, installments]
  );
  return result.id;
}

export async function updateCreditCard(cardId, updates) {
  const { name, limit, closingDay, dueDay } = updates;
  const result = await run(
    'UPDATE credit_cards SET name = ?, limit = ?, closing_day = ?, due_day = ? WHERE id = ?',
    [name, limit, closingDay, dueDay, cardId]
  );
  return result.changes > 0;
}

export async function deactivateCreditCard(cardId) {
  const result = await run(
    'UPDATE credit_cards SET is_active = 0 WHERE id = ?',
    [cardId]
  );
  return result.changes > 0;
}
