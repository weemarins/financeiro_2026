import * as investmentService from '../services/investmentService.js';

export async function createInvestment(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { name, type, initialAmount, description, expectedAnnualReturn } = req.body;

    if (!name || !type || !initialAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type === 'fixed' && (expectedAnnualReturn === undefined || expectedAnnualReturn === null || expectedAnnualReturn === '')) {
      return res.status(400).json({ error: 'Expected annual return is required for fixed-income investments' });
    }
    if (type === 'fixed' && (Number.isNaN(Number(expectedAnnualReturn)) || Number(expectedAnnualReturn) < 0)) {
      return res.status(400).json({ error: 'Expected annual return must be a non-negative number' });
    }

    const normalizedExpectedAnnualReturn = type === 'fixed' ? Number(expectedAnnualReturn) : null;

    const investmentId = await investmentService.createInvestment(
      familyId,
      userId,
      name,
      type,
      initialAmount,
      description,
      normalizedExpectedAnnualReturn
    );

    res.status(201).json({ id: investmentId, message: 'Investment created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getInvestments(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const investments = await investmentService.getUserInvestments(familyId, userId);
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getInvestmentDetails(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const investment = await investmentService.getInvestmentDetails(id, familyId, userId);

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addContribution(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { amount, date } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }

    const contributionId = await investmentService.addContribution(id, familyId, userId, amount, date);

    res.status(201).json({ id: contributionId, message: 'Contribution added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateInvestmentValue(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { newValue } = req.body;

    if (newValue === undefined) {
      return res.status(400).json({ error: 'newValue is required' });
    }

    const success = await investmentService.updateInvestmentValue(id, familyId, userId, newValue);
    if (!success) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment value updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteInvestment(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;

    const success = await investmentService.deleteInvestment(id, familyId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateExpectedAnnualReturn(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { expectedAnnualReturn } = req.body;

    if (expectedAnnualReturn === undefined || expectedAnnualReturn === null || expectedAnnualReturn === '') {
      return res.status(400).json({ error: 'expectedAnnualReturn is required' });
    }

    const success = await investmentService.updateExpectedAnnualReturn(id, familyId, userId, expectedAnnualReturn);
    if (!success) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Expected annual return updated successfully' });
  } catch (error) {
    if (error.message.includes('fixed-income')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}
