import * as investmentService from '../services/investmentService.js';

export async function createInvestment(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { name, type, initialAmount, description } = req.body;

    if (!name || !type || !initialAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const investmentId = await investmentService.createInvestment(
      familyId,
      userId,
      name,
      type,
      initialAmount,
      description
    );

    res.status(201).json({ id: investmentId, message: 'Investment created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getInvestments(req, res) {
  try {
    const familyId = req.user.familyId;
    const investments = await investmentService.getFamilyInvestments(familyId);
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getInvestmentDetails(req, res) {
  try {
    const { id } = req.params;
    const investment = await investmentService.getInvestmentDetails(id);

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
    const { amount, date } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }

    const contributionId = await investmentService.addContribution(id, amount, date);

    res.status(201).json({ id: contributionId, message: 'Contribution added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateInvestmentValue(req, res) {
  try {
    const { id } = req.params;
    const { newValue } = req.body;

    if (newValue === undefined) {
      return res.status(400).json({ error: 'newValue is required' });
    }

    const success = await investmentService.updateInvestmentValue(id, newValue);
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

    const success = await investmentService.deleteInvestment(id);
    if (!success) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
