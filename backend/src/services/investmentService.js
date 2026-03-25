import { run, get, all } from '../database/connection.js';

export async function createInvestment(familyId, userId, name, type, initialAmount, description, expectedAnnualReturn) {
  const result = await run(
    `INSERT INTO investments (family_id, user_id, name, type, expected_annual_return, initial_amount, current_amount, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, name, type, expectedAnnualReturn, initialAmount, initialAmount, description]
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

  const totalContributedValue = (totalContributed?.total || 0) + investment.initial_amount;
  const profitLoss = investment.current_amount - totalContributedValue;
  const profitLossPercentage = totalContributedValue > 0 ? (profitLoss / totalContributedValue) * 100 : 0;
  const expectedAnnualReturn = Number(investment.expected_annual_return || 0);
  const projectedReturns = {
    shortTerm: calculateProjection(investment.current_amount, expectedAnnualReturn, 1),
    mediumTerm: calculateProjection(investment.current_amount, expectedAnnualReturn, 3),
    longTerm: calculateProjection(investment.current_amount, expectedAnnualReturn, 10),
  };

  return {
    ...investment,
    contributions,
    totalContributed: totalContributedValue,
    profitLoss,
    profitLossPercentage: profitLossPercentage.toFixed(2),
    projectedReturns,
  };
}

export async function addContribution(investmentId, familyId, userId, amount, date) {
  const investment = await get(
    'SELECT id, current_amount FROM investments WHERE id = ? AND family_id = ? AND user_id = ? AND is_active = 1',
    [investmentId, familyId, userId]
  );
  if (!investment) {
    throw new Error('Investment not found');
  }

  const result = await run(
    'INSERT INTO investment_contributions (investment_id, amount, date) VALUES (?, ?, ?)',
    [investmentId, amount, date]
  );

  // Atualizar valor atual preservando rendimento já acumulado.
  // Somar aporte ao valor atual evita zerar lucro/prejuízo ao registrar novos aportes.
  const newTotal = Number(investment.current_amount || 0) + Number(amount || 0);

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

export async function updateExpectedAnnualReturn(investmentId, familyId, userId, expectedAnnualReturn) {
  const investment = await get(
    'SELECT id, type FROM investments WHERE id = ? AND family_id = ? AND user_id = ? AND is_active = 1',
    [investmentId, familyId, userId]
  );

  if (!investment) {
    throw new Error('Investment not found');
  }

  if (investment.type !== 'fixed') {
    throw new Error('Expected annual return can only be changed for fixed-income investments');
  }

  const result = await run(
    'UPDATE investments SET expected_annual_return = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND family_id = ? AND user_id = ?',
    [expectedAnnualReturn, investmentId, familyId, userId]
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

function calculateProjection(baseAmount, annualReturnPercentage, years) {
  const principal = Number(baseAmount || 0);
  const annualRate = Number(annualReturnPercentage || 0) / 100;
  const futureValue = principal * ((1 + annualRate) ** years);
  return Number(futureValue.toFixed(2));
}
