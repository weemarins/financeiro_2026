import express from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

// Receitas
router.post('/incomes', transactionController.createIncome);
router.get('/incomes', transactionController.getIncomes);
router.put('/incomes/:id', transactionController.updateIncome);
router.delete('/incomes/:id', transactionController.deleteIncome);

// Despesas
router.post('/expenses', transactionController.createExpense);
router.get('/expenses', transactionController.getExpenses);
router.put('/expenses/:id', transactionController.updateExpense);
router.delete('/expenses/:id', transactionController.deleteExpense);

// Categorias
router.post('/categories', transactionController.createCategory);
router.get('/categories', transactionController.getCategories);
router.put('/categories/:id', transactionController.updateCategory);
router.delete('/categories/:id', transactionController.deleteCategory);

export default router;
