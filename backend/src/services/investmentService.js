import { run, get, all } from '../database/connection.js';

export async function createInvestment(familyId, userId, name, type, initialAmount, description) {
  const result = await run(
    `INSERT INTO investments (family_id, user_id, name, type, initial_amount, current_amount, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, name, type, initialAmount, initialAmount, description]
  );
  return result.id;
}

export async function getUserInvestments(familyId, userId) {
  return all(
    `SELECT i.*, u.name as user_name 
     FROM investments i 
     JOIN users u ON u.id = i.user_id
     WHERE i.family_id = ? AND i.user_id = ? AND i.is_active = 1
     ORDER BY i.name`,
    [familyId, userId]
  );
}

export async function getInvestmentDetails(investmentId, familyId, userId) {
  const investment = await get(
    'SELECT * FROM investments WHERE id = ? AND family_id = ? AND user_id = ?',
    [investmentId, familyId, userId]
  );

  if (!investment) return null;

  const contributions = await all(
    'SELECT * FROM investment_contributions WHERE investment_id = ? ORDER BY date DESC',
    [investmentId]
  );

  const totalContributed = await get(
    'SELECT SUM(amount) as total FROM investment_contributions WHERE investment_id = ?',
    [investmentId]
  );

  const profitLoss = investment.current_amount - investment.initial_amount;
  const profitLossPercentage = investment.initial_amount > 0 ? (profitLoss / investment.initial_amount) * 100 : 0;

  return {
    ...investment,
    contributions,
    totalContributed: (totalContributed?.total || 0) + investment.initial_amount,
    profitLoss,
    profitLossPercentage: profitLossPercentage.toFixed(2)
  };
}

export async function addContribution(investmentId, familyId, userId, amount, date) {
  const investment = await get(
    'SELECT id, initial_amount FROM investments WHERE id = ? AND family_id = ? AND user_id = ? AND is_active = 1',
    [investmentId, familyId, userId]
  );
  if (!investment) {
    throw new Error('Investment not found');
  }

  const result = await run(
    'INSERT INTO investment_contributions (investment_id, amount, date) VALUES (?, ?, ?)',
    [investmentId, amount, date]
  );

  // Atualizar valor atual do investimento
  const totalContributions = await get(
    'SELECT SUM(amount) as total FROM investment_contributions WHERE investment_id = ?',
    [investmentId]
  );

  const newTotal = investment.initial_amount + (totalContributions?.total || 0);

  await run(
    'UPDATE investments SET current_amount = ? WHERE id = ?',
    [newTotal, investmentId]
  );

  return result.id;
}

export async function updateInvestmentValue(investmentId, familyId, userId, newValue) {
  const result = await run(
    'UPDATE investments SET current_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND family_id = ? AND user_id = ?',
    [newValue, investmentId, familyId, userId]
  );
  return result.changes > 0;
}

export async function deleteInvestment(investmentId, familyId, userId) {
  const result = await run(
    'UPDATE investments SET is_active = 0 WHERE id = ? AND family_id = ? AND user_id = ?',
    [investmentId, familyId, userId]
  );
  return result.changes > 0;
}
