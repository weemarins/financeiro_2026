import api from './api.js';

export const authService = {
  register: (familyId, name, email, password) =>
    api.post('/auth/register', { familyId, name, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (name, email) =>
    api.put('/auth/profile', { name, email }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  getFamilyUsers: () =>
    api.get('/auth/family-users'),

  createFamilyUser: (name, email, password, role) =>
    api.post('/auth/family-users', { name, email, password, role }),

  updateFamilyUser: (id, payload) =>
    api.put(`/auth/family-users/${id}`, payload),

  deleteFamilyUser: (id) =>
    api.delete(`/auth/family-users/${id}`),
};

export const dashboardService = {
  getDashboard: (startDate, endDate) =>
    api.get('/dashboard/dashboard', { params: { startDate, endDate } }),

  getMonthlyDashboard: (year, month) =>
    api.get('/dashboard/dashboard/monthly', { params: { year, month } }),
};

export const transactionService = {
  createIncome: (categoryId, description, amount, date, isRecurring, recurringType) =>
    api.post('/transactions/incomes', { categoryId, description, amount, date, isRecurring, recurringType }),

  getIncomes: (startDate, endDate) =>
    api.get('/transactions/incomes', { params: { startDate, endDate } }),

  updateIncome: (id, updates) =>
    api.put(`/transactions/incomes/${id}`, updates),

  deleteIncome: (id) =>
    api.delete(`/transactions/incomes/${id}`),

  createExpense: (categoryId, description, amount, date, paymentMethod, isRecurring, recurringType, installments) =>
    api.post('/transactions/expenses', { categoryId, description, amount, date, paymentMethod, isRecurring, recurringType, installments }),

  getExpenses: (startDate, endDate) =>
    api.get('/transactions/expenses', { params: { startDate, endDate } }),

  updateExpense: (id, updates) =>
    api.put(`/transactions/expenses/${id}`, updates),

  deleteExpense: (id) =>
    api.delete(`/transactions/expenses/${id}`),

  createCategory: (name, type, color, icon) =>
    api.post('/transactions/categories', { name, type, color, icon }),

  getCategories: (type) =>
    api.get('/transactions/categories', { params: { type } }),

  updateCategory: (id, updates) =>
    api.put(`/transactions/categories/${id}`, updates),

  deleteCategory: (id) =>
    api.delete(`/transactions/categories/${id}`),
};

export const creditCardService = {
  createCard: (name, cardNumber, bank, limit, closingDay, dueDay) =>
    api.post('/credit-cards/cards', { name, cardNumber, bank, limit, closingDay, dueDay }),

  getCards: () =>
    api.get('/credit-cards/cards'),

  getCardDetails: (id) =>
    api.get(`/credit-cards/cards/${id}`),

  addTransaction: (cardId, expenseId, description, amount, date, installments, isSubscription) =>
    api.post(`/credit-cards/cards/${cardId}/transactions`, {
      expenseId,
      description,
      amount,
      date,
      installments,
      isSubscription,
    }),

  removeTransaction: (cardId, transactionId) =>
    api.delete(`/credit-cards/cards/${cardId}/transactions/${transactionId}`),

  updateCard: (id, updates) =>
    api.put(`/credit-cards/cards/${id}`, updates),

  deactivateCard: (id) =>
    api.delete(`/credit-cards/cards/${id}`),
};

export const investmentService = {
  createInvestment: (name, type, initialAmount, description, expectedAnnualReturn) =>
    api.post('/investments/investments', { name, type, initialAmount, description, expectedAnnualReturn }),

  getInvestments: () =>
    api.get('/investments/investments'),

  getInvestmentDetails: (id) =>
    api.get(`/investments/investments/${id}`),

  addContribution: (id, amount, date) =>
    api.post(`/investments/investments/${id}/contributions`, { amount, date }),

  updateInvestmentValue: (id, newValue) =>
    api.put(`/investments/investments/${id}/value`, { newValue }),

  updateExpectedReturn: (id, expectedAnnualReturn) =>
    api.put(`/investments/investments/${id}/expected-return`, { expectedAnnualReturn }),

  deleteInvestment: (id) =>
    api.delete(`/investments/investments/${id}`),
};

export const goalsService = {
  createGoal: (name, description, goalAmount, frequency, targetDate) =>
    api.post('/goals/goals', { name, description, goalAmount, frequency, targetDate }),

  getGoals: () =>
    api.get('/goals/goals'),

  getGoalDetails: (id) =>
    api.get(`/goals/goals/${id}`),

  updateGoalProgress: (id, amount) =>
    api.put(`/goals/goals/${id}/progress`, { amount }),

  deleteGoal: (id) =>
    api.delete(`/goals/goals/${id}`),

  getEmergencyFund: () =>
    api.get('/goals/emergency-fund'),

  createEmergencyFund: (targetAmount) =>
    api.post('/goals/emergency-fund', { targetAmount }),

  addToEmergencyFund: (amount) =>
    api.put('/goals/emergency-fund/add', { amount }),

  updateEmergencyFundTarget: (newTarget) =>
    api.put('/goals/emergency-fund/target', { newTarget }),

  calculateEmergencyFundSuggestion: (monthsOfExpenses) =>
    api.get('/goals/emergency-fund/suggestion', { params: { monthsOfExpenses } }),
};
