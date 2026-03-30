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
    const userId = req.user.userId;
    const cards = await creditCardService.getUserCreditCards(familyId, userId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCardDetails(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const card = await creditCardService.getCreditCardDetails(id, familyId, userId);

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
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { expenseId, description, amount, date, installments, isSubscription } = req.body;

    if (!description || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transactionId = await creditCardService.addCardTransaction(
      cardId,
      familyId,
      userId,
      expenseId,
      description,
      amount,
      date,
      installments,
      Boolean(isSubscription)
    );

    res.status(201).json({ id: transactionId, message: 'Transaction added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const updates = req.body;

    const success = await creditCardService.updateCreditCard(id, familyId, userId, updates);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeTransaction(req, res) {
  try {
    const { cardId, transactionId } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;

    const success = await creditCardService.removeCardTransaction(cardId, transactionId, familyId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deactivateCard(req, res) {
  try {
    const { id } = req.params;
    const familyId = req.user.familyId;
    const userId = req.user.userId;

    const success = await creditCardService.deactivateCreditCard(id, familyId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
