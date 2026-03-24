import * as transactionService from '../services/transactionService.js';

// RECEITAS

export async function createIncome(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { categoryId, description, amount, date, isRecurring, recurringType } = req.body;

    if (!categoryId || !description || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const incomeId = await transactionService.createIncome(
      familyId,
      userId,
      categoryId,
      description,
      amount,
      date,
      isRecurring,
      recurringType
    );

    res.status(201).json({ id: incomeId, message: 'Income created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getIncomes(req, res) {
  try {
    const familyId = req.user.familyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const incomes = await transactionService.getFamilyIncomes(familyId, startDate, endDate);
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateIncome(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await transactionService.updateIncome(id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteIncome(req, res) {
  try {
    const { id } = req.params;

    const success = await transactionService.deleteIncome(id);
    if (!success) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DESPESAS

export async function createExpense(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { categoryId, description, amount, date, paymentMethod, isRecurring, recurringType, installments } = req.body;

    if (!categoryId || !description || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expenseId = await transactionService.createExpense(
      familyId,
      userId,
      categoryId,
      description,
      amount,
      date,
      paymentMethod,
      isRecurring,
      recurringType,
      installments
    );

    res.status(201).json({ id: expenseId, message: 'Expense created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getExpenses(req, res) {
  try {
    const familyId = req.user.familyId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const expenses = await transactionService.getFamilyExpenses(familyId, startDate, endDate);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await transactionService.updateExpense(id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    const success = await transactionService.deleteExpense(id);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// CATEGORIAS

export async function createCategory(req, res) {
  try {
    const familyId = req.user.familyId;
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const categoryId = await transactionService.createCategory(familyId, name, type, color, icon);

    res.status(201).json({ id: categoryId, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  try {
    const familyId = req.user.familyId;
    const { type } = req.query;

    const categories = await transactionService.getFamilyCategories(familyId, type);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await transactionService.updateCategory(id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Category not found or is a system category' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const success = await transactionService.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ error: 'Category not found or is a system category' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
