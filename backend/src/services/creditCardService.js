import { run, get, all } from '../database/connection.js';

function buildInvoiceDueDateExpression(dateField) {
  return `
CASE
  WHEN cc.closing_day IS NULL OR cc.due_day IS NULL THEN ${dateField}
  ELSE
    CASE
      WHEN cc.due_day > cc.closing_day THEN
        date(
          CASE
            WHEN CAST(strftime('%d', ${dateField}) AS INTEGER) <= cc.closing_day THEN
              date(date(${dateField}, 'start of month'), '+' || (cc.closing_day - 1) || ' days')
            ELSE
              date(date(${dateField}, 'start of month'), '+1 month', '+' || (cc.closing_day - 1) || ' days')
          END,
          'start of month',
          '+' || (cc.due_day - 1) || ' days'
        )
      ELSE
        date(
          CASE
            WHEN CAST(strftime('%d', ${dateField}) AS INTEGER) <= cc.closing_day THEN
              date(date(${dateField}, 'start of month'), '+' || (cc.closing_day - 1) || ' days')
            ELSE
              date(date(${dateField}, 'start of month'), '+1 month', '+' || (cc.closing_day - 1) || ' days')
          END,
          'start of month',
          '+1 month',
          '+' || (cc.due_day - 1) || ' days'
        )
    END
END
`;
}

const invoiceDueDateExpression = buildInvoiceDueDateExpression('ci.installment_date');

export async function createCreditCard(familyId, userId, name, cardNumber, bank, limit, closingDay, dueDay) {
  const result = await run(
    `INSERT INTO credit_cards (family_id, user_id, name, card_number, bank, "limit", closing_day, due_day) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, name, cardNumber, bank, limit, closingDay, dueDay]
  );
  return result.id;
}

export async function getUserCreditCards(familyId, userId) {
  return all(
    `SELECT cc.*, u.name as user_name 
     FROM credit_cards cc 
     JOIN users u ON u.id = cc.user_id
     WHERE cc.family_id = ? AND cc.user_id = ? AND cc.is_active = 1
     ORDER BY cc.name`,
    [familyId, userId]
  );
}

export async function getCreditCardDetails(cardId, familyId, userId) {
  const card = await get(
    'SELECT * FROM credit_cards WHERE id = ? AND family_id = ? AND user_id = ?',
    [cardId, familyId, userId]
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
    `WITH RECURSIVE card_installments AS (
      SELECT
        ct.id,
        ct.credit_card_id,
        ct.amount,
        COALESCE(NULLIF(ct.installments, 0), 1) as installments,
        1 as installment_current,
        date(ct.date) as installment_date
      FROM card_transactions ct
      WHERE ct.credit_card_id = ?

      UNION ALL

      SELECT
        ci.id,
        ci.credit_card_id,
        ci.amount,
        ci.installments,
        ci.installment_current + 1,
        date(ci.installment_date, '+1 month')
      FROM card_installments ci
      WHERE ci.installment_current < ci.installments
    )
    SELECT COALESCE(SUM(ci.amount / ci.installments), 0) as total
    FROM card_installments ci
    JOIN credit_cards cc ON cc.id = ci.credit_card_id
    WHERE ${invoiceDueDateExpression} BETWEEN date('now', 'start of month') AND date('now', 'start of month', '+1 month', '-1 day')`,
    [cardId]
  );

  const outstandingUsage = await get(
    `WITH RECURSIVE card_installments AS (
      SELECT
        ct.id,
        ct.credit_card_id,
        ct.amount,
        COALESCE(NULLIF(ct.installments, 0), 1) as installments,
        1 as installment_current,
        date(ct.date) as installment_date
      FROM card_transactions ct
      WHERE ct.credit_card_id = ?

      UNION ALL

      SELECT
        ci.id,
        ci.credit_card_id,
        ci.amount,
        ci.installments,
        ci.installment_current + 1,
        date(ci.installment_date, '+1 month')
      FROM card_installments ci
      WHERE ci.installment_current < ci.installments
    )
    SELECT COALESCE(SUM(ci.amount / ci.installments), 0) as total
    FROM card_installments ci
    JOIN credit_cards cc ON cc.id = ci.credit_card_id
    WHERE ${invoiceDueDateExpression} >= date('now')`,
    [cardId]
  );

  return {
    ...card,
    transactions,
    currentBill: currentBill?.total || 0,
    availableLimit: card.limit - (outstandingUsage?.total || 0)
  };
}

export async function addCardTransaction(cardId, familyId, userId, expenseId, description, amount, date, installments = 1) {
  const card = await get(
    'SELECT id FROM credit_cards WHERE id = ? AND family_id = ? AND user_id = ?',
    [cardId, familyId, userId]
  );
  if (!card) {
    throw new Error('Card not found');
  }

  if (expenseId) {
    const expense = await get(
      'SELECT id FROM expenses WHERE id = ? AND family_id = ? AND user_id = ?',
      [expenseId, familyId, userId]
    );
    if (!expense) {
      throw new Error('Expense not found');
    }
  }

  const result = await run(
    `INSERT INTO card_transactions (credit_card_id, expense_id, description, amount, date, installments) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cardId, expenseId, description, amount, date, installments]
  );
  return result.id;
}

export async function updateCreditCard(cardId, familyId, userId, updates) {
  const { name, limit, closingDay, dueDay } = updates;
  const result = await run(
    'UPDATE credit_cards SET name = ?, "limit" = ?, closing_day = ?, due_day = ? WHERE id = ? AND family_id = ? AND user_id = ?',
    [name, limit, closingDay, dueDay, cardId, familyId, userId]
  );
  return result.changes > 0;
}

export async function deactivateCreditCard(cardId, familyId, userId) {
  const result = await run(
    'UPDATE credit_cards SET is_active = 0 WHERE id = ? AND family_id = ? AND user_id = ?',
    [cardId, familyId, userId]
  );
  return result.changes > 0;
}
