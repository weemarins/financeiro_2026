import * as goalsService from '../services/goalsService.js';

// GOALS (METAS)

export async function createGoal(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { name, description, goalAmount, frequency, targetDate } = req.body;

    if (!name || !goalAmount) {
      return res.status(400).json({ error: 'Name and goalAmount are required' });
    }

    const goalId = await goalsService.createGoal(
      familyId,
      userId,
      name,
      description,
      goalAmount,
      frequency,
      targetDate
    );

    res.status(201).json({ id: goalId, message: 'Goal created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getGoals(req, res) {
  try {
    const familyId = req.user.familyId;
    const goals = await goalsService.getFamilyGoals(familyId);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getGoalDetails(req, res) {
  try {
    const { id } = req.params;
    const goal = await goalsService.getGoalDetails(id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateGoalProgress(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const success = await goalsService.updateGoalProgress(id, amount);
    if (!success) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const { id } = req.params;

    const success = await goalsService.deleteGoal(id);
    if (!success) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// EMERGENCY FUND

export async function getEmergencyFund(req, res) {
  try {
    const familyId = req.user.familyId;
    const fund = await goalsService.getEmergencyFund(familyId);

    if (!fund) {
      return res.status(404).json({ error: 'Emergency fund not found' });
    }

    res.json(fund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createEmergencyFund(req, res) {
  try {
    const familyId = req.user.familyId;
    const { targetAmount } = req.body;

    if (!targetAmount) {
      return res.status(400).json({ error: 'targetAmount is required' });
    }

    const fundId = await goalsService.createEmergencyFund(familyId, targetAmount);

    res.status(201).json({ id: fundId, message: 'Emergency fund created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addToEmergencyFund(req, res) {
  try {
    const familyId = req.user.familyId;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const success = await goalsService.addToEmergencyFund(familyId, amount);
    if (!success) {
      return res.status(404).json({ error: 'Emergency fund not found' });
    }

    res.json({ message: 'Amount added to emergency fund successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateEmergencyFundTarget(req, res) {
  try {
    const familyId = req.user.familyId;
    const { newTarget } = req.body;

    if (!newTarget) {
      return res.status(400).json({ error: 'newTarget is required' });
    }

    const success = await goalsService.updateEmergencyFundTarget(familyId, newTarget);
    if (!success) {
      return res.status(404).json({ error: 'Emergency fund not found' });
    }

    res.json({ message: 'Emergency fund target updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function calculateEmergencyFundSuggestion(req, res) {
  try {
    const familyId = req.user.familyId;
    const { monthsOfExpenses } = req.query;

    const suggestion = await goalsService.calculateEmergencyFundSuggestion(
      familyId,
      monthsOfExpenses ? parseInt(monthsOfExpenses) : 3
    );

    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
