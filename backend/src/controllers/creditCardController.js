import * as creditCardService from '../services/creditCardService.js';

export async function createCard(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { name, cardNumber, bank, limit, closingDay, dueDay } = req.body;

    if (!name || !bank || !limit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cardId = await creditCardService.createCreditCard(
      familyId,
      userId,
      name,
      cardNumber,
      bank,
      limit,
      closingDay,
      dueDay
    );

    res.status(201).json({ id: cardId, message: 'Credit card created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCards(req, res) {
  try {
    const familyId = req.user.familyId;
    const cards = await creditCardService.getFamilyCreditCards(familyId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCardDetails(req, res) {
  try {
    const { id } = req.params;
    const card = await creditCardService.getCreditCardDetails(id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addTransaction(req, res) {
  try {
    const { cardId } = req.params;
    const { expenseId, description, amount, date, installments } = req.body;

    if (!description || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transactionId = await creditCardService.addCardTransaction(
      cardId,
      expenseId,
      description,
      amount,
      date,
      installments
    );

    res.status(201).json({ id: transactionId, message: 'Transaction added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await creditCardService.updateCreditCard(id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deactivateCard(req, res) {
  try {
    const { id } = req.params;

    const success = await creditCardService.deactivateCreditCard(id);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
