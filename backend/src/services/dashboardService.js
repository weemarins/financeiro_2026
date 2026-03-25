import { get, all } from '../database/connection.js';

const invoiceDueDateExpression = `
CASE
  WHEN cc.closing_day IS NULL OR cc.due_day IS NULL THEN ct.date
  ELSE
    CASE
      WHEN cc.due_day > cc.closing_day THEN
        date(
          CASE
            WHEN CAST(strftime('%d', ct.date) AS INTEGER) <= cc.closing_day THEN
              date(date(ct.date, 'start of month'), '+' || (cc.closing_day - 1) || ' days')
            ELSE
              date(date(ct.date, 'start of month'), '+1 month', '+' || (cc.closing_day - 1) || ' days')
          END,
          'start of month',
          '+' || (cc.due_day - 1) || ' days'
        )
      ELSE
        date(
          CASE
            WHEN CAST(strftime('%d', ct.date) AS INTEGER) <= cc.closing_day THEN
              date(date(ct.date, 'start of month'), '+' || (cc.closing_day - 1) || ' days')
            ELSE
              date(date(ct.date, 'start of month'), '+1 month', '+' || (cc.closing_day - 1) || ' days')
          END,
          'start of month',
          '+1 month',
          '+' || (cc.due_day - 1) || ' days'
        )
    END
END
`;

export async function getDashboardData(familyId, userId, startDate, endDate) {
  // Receitas totais
  const totalIncomes = await get(
    'SELECT SUM(amount) as total FROM incomes WHERE family_id = ? AND user_id = ? AND date BETWEEN ? AND ?',
    [familyId, userId, startDate, endDate]
  );

  // Despesas totais (incluindo compras lançadas nos cartões)
  const totalExpenses = await get(
    `SELECT
      COALESCE((
        SELECT SUM(e.amount)
        FROM expenses e
        WHERE e.family_id = ? AND e.user_id = ? AND e.date BETWEEN ? AND ?
      ), 0) +
      COALESCE((
        SELECT SUM(ct.amount)
        FROM card_transactions ct
        JOIN credit_cards cc ON cc.id = ct.credit_card_id
        WHERE cc.family_id = ? AND cc.user_id = ? AND ${invoiceDueDateExpression} BETWEEN ? AND ?
      ), 0) as total`,
    [familyId, userId, startDate, endDate, familyId, userId, startDate, endDate]
  );

  // Saldo em investimentos
  const totalInvestments = await get(
    'SELECT SUM(current_amount) as total FROM investments WHERE family_id = ? AND user_id = ? AND is_active = 1',
    [familyId, userId]
  );

  // Receitas por categoria
  const incomesByCategory = await all(
    `SELECT c.name, SUM(i.amount) as total 
     FROM incomes i 
     JOIN categories c ON c.id = i.category_id 
     WHERE i.family_id = ? AND i.user_id = ? AND i.date BETWEEN ? AND ? 
     GROUP BY c.name`,
    [familyId, userId, startDate, endDate]
  );

  // Despesas por categoria
  const expensesByCategory = await all(
    `SELECT c.name, SUM(e.amount) as total 
     FROM expenses e 
     JOIN categories c ON c.id = e.category_id 
     WHERE e.family_id = ? AND e.user_id = ? AND e.date BETWEEN ? AND ? 
     GROUP BY c.name`,
    [familyId, userId, startDate, endDate]
  );

  // Cartões de crédito
  const creditCards = await all(
    `SELECT
      cc.id,
      cc.name,
      cc."limit" as "limit",
      (
        SELECT SUM(ct.amount)
        FROM card_transactions ct
        WHERE ct.credit_card_id = cc.id
      ) as current_usage
     FROM credit_cards cc
     WHERE cc.family_id = ? AND cc.user_id = ? AND cc.is_active = 1`,
    [familyId, userId]
  );

  return {
    totalIncomes: totalIncomes?.total || 0,
    totalExpenses: totalExpenses?.total || 0,
    totalInvestments: totalInvestments?.total || 0,
    balance: (totalIncomes?.total || 0) - (totalExpenses?.total || 0),
    incomesByCategory: incomesByCategory || [],
    expensesByCategory: expensesByCategory || [],
    creditCards: creditCards || []
  };
}

export async function getMonthlyData(familyId, userId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  return getDashboardData(familyId, userId, startDate, endDate);
}
