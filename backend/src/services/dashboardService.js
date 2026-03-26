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
  const expensesInstallmentsCte = `
WITH RECURSIVE expense_installments AS (
  SELECT
    e.id,
    e.family_id,
    e.user_id,
    e.category_id,
    e.payment_method,
    e.amount,
    COALESCE(NULLIF(e.installments, 0), 1) as installments,
    1 as installment_current,
    date(e.date) as installment_date
  FROM expenses e
  WHERE e.family_id = ? AND e.user_id = ?

  UNION ALL

  SELECT
    ei.id,
    ei.family_id,
    ei.user_id,
    ei.category_id,
    ei.payment_method,
    ei.amount,
    ei.installments,
    ei.installment_current + 1,
    date(ei.installment_date, '+1 month')
  FROM expense_installments ei
  WHERE ei.installment_current < ei.installments
)
`;

  // Receitas totais
  const totalIncomes = await get(
    'SELECT SUM(amount) as total FROM incomes WHERE family_id = ? AND user_id = ? AND date BETWEEN ? AND ?',
    [familyId, userId, startDate, endDate]
  );

  // Despesas totais (incluindo compras lançadas nos cartões)
  const totalExpenses = await get(
    `${expensesInstallmentsCte}
     SELECT
      COALESCE((
        SELECT SUM(
          CASE
            WHEN ei.installments > 1 AND COALESCE(ei.payment_method, 'cash') != 'credit_card' THEN ei.amount / ei.installments
            ELSE ei.amount
          END
        )
        FROM expense_installments ei
        WHERE ei.installment_date BETWEEN ? AND ?
      ), 0) +
      COALESCE((
        SELECT SUM(ct.amount)
        FROM card_transactions ct
        JOIN credit_cards cc ON cc.id = ct.credit_card_id
        WHERE cc.family_id = ?
          AND cc.user_id = ?
          AND cc.is_active = 1
          AND ${invoiceDueDateExpression} BETWEEN ? AND ?
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

  // Despesas por categoria (incluindo compras lançadas no cartão de crédito)
  const expensesByCategory = await all(
    `${expensesInstallmentsCte}
     SELECT
      name,
      SUM(total) as total
     FROM (
      SELECT
        c.name as name,
        CASE
          WHEN ei.installments > 1 AND COALESCE(ei.payment_method, 'cash') != 'credit_card' THEN ei.amount / ei.installments
          ELSE ei.amount
        END as total
      FROM expense_installments ei
      JOIN categories c ON c.id = ei.category_id
      WHERE ei.installment_date BETWEEN ? AND ?

      UNION ALL

      SELECT
        COALESCE(c.name, 'Cartão de crédito') as name,
        ct.amount as total
      FROM card_transactions ct
      JOIN credit_cards cc ON cc.id = ct.credit_card_id
      LEFT JOIN expenses e ON e.id = ct.expense_id
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE cc.family_id = ?
        AND cc.user_id = ?
        AND cc.is_active = 1
        AND ${invoiceDueDateExpression} BETWEEN ? AND ?
     ) grouped_expenses
     GROUP BY name`,
    [
      familyId,
      userId,
      startDate,
      endDate,
      familyId,
      userId,
      startDate,
      endDate
    ]
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
