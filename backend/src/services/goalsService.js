import { run, get, all } from '../database/connection.js';

export async function createGoal(familyId, userId, name, description, goalAmount, frequency, targetDate) {
  const result = await run(
    `INSERT INTO goals (family_id, user_id, name, description, goal_amount, frequency, target_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [familyId, userId, name, description, goalAmount, frequency, targetDate]
  );
  return result.id;
}

export async function getFamilyGoals(familyId) {
  return all(
    `SELECT g.*, u.name as user_name 
     FROM goals g 
     JOIN users u ON u.id = g.user_id
     WHERE g.family_id = ? AND g.is_active = 1
     ORDER BY g.target_date`,
    [familyId]
  );
}

export async function getGoalDetails(goalId) {
  const goal = await get(
    'SELECT * FROM goals WHERE id = ?',
    [goalId]
  );

  if (!goal) return null;

  const progressPercentage = goal.goal_amount > 0 ? (goal.current_amount / goal.goal_amount) * 100 : 0;
  const remainingAmount = Math.max(0, goal.goal_amount - goal.current_amount);

  const daysRemaining = goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return {
    ...goal,
    progressPercentage: Math.min(100, progressPercentage),
    remainingAmount,
    daysRemaining
  };
}

export async function updateGoalProgress(goalId, amount) {
  const result = await run(
    'UPDATE goals SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [amount, goalId]
  );
  return result.changes > 0;
}

export async function deleteGoal(goalId) {
  const result = await run(
    'UPDATE goals SET is_active = 0 WHERE id = ?',
    [goalId]
  );
  return result.changes > 0;
}

// RESERVA DE EMERGÊNCIA

export async function getEmergencyFund(familyId) {
  return get(
    'SELECT * FROM emergency_fund WHERE family_id = ?',
    [familyId]
  );
}

export async function createEmergencyFund(familyId, targetAmount) {
  const result = await run(
    'INSERT INTO emergency_fund (family_id, target_amount, current_amount) VALUES (?, ?, 0)',
    [familyId, targetAmount]
  );
  return result.id;
}

export async function addToEmergencyFund(familyId, amount) {
  const result = await run(
    'UPDATE emergency_fund SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE family_id = ?',
    [amount, familyId]
  );
  return result.changes > 0;
}

export async function updateEmergencyFundTarget(familyId, newTarget) {
  const result = await run(
    'UPDATE emergency_fund SET target_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE family_id = ?',
    [newTarget, familyId]
  );
  return result.changes > 0;
}

export async function calculateEmergencyFundSuggestion(familyId, monthsOfExpenses = 3) {
  // Calcular despesa média mensal dos últimos 3 meses
  const lastDate = new Date();
  const threeMonthsAgo = new Date(lastDate.getFullYear(), lastDate.getMonth() - 3, 1).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const avgExpense = await get(
    `SELECT SUM(amount) / 3 as avg FROM expenses 
     WHERE family_id = ? AND date BETWEEN ? AND ?`,
    [familyId, threeMonthsAgo, today]
  );

  const suggestion = (avgExpense?.avg || 0) * monthsOfExpenses;

  await run(
    'UPDATE emergency_fund SET monthly_suggestion = ?, updated_at = CURRENT_TIMESTAMP WHERE family_id = ?',
    [suggestion, familyId]
  );

  return suggestion;
}
