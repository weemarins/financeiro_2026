import React from 'react';
import { MainLayout } from '../components/Layout.jsx';
import { authService, creditCardService, goalsService, investmentService, transactionService } from '../services/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DashboardPage as Dashboard } from './DashboardPage.jsx';

export { Dashboard as DashboardPage };

export function TransactionsPage() {
  const [transactionType, setTransactionType] = React.useState('expense');
  const [categories, setCategories] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [period, setPeriod] = React.useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formData, setFormData] = React.useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
    paymentMethod: 'cash',
  });

  const [newCategoryName, setNewCategoryName] = React.useState('');

  const [startDate, endDate] = React.useMemo(() => {
    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
  }, [period]);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [categoriesResponse, transactionsResponse] = await Promise.all([
        transactionService.getCategories(transactionType),
        transactionType === 'income'
          ? transactionService.getIncomes(startDate, endDate)
          : transactionService.getExpenses(startDate, endDate),
      ]);

      setCategories(categoriesResponse.data || []);
      setTransactions(transactionsResponse.data || []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as transações.');
    } finally {
      setLoading(false);
    }
  }, [transactionType, startDate, endDate]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, categoryId: '' }));
  }, [transactionType]);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const totalAmount = transactions.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!formData.categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    const payload = {
      categoryId: Number(formData.categoryId),
      description: formData.description.trim(),
      amount: Number(formData.amount),
      date: formData.date,
    };

    if (!payload.description || !payload.amount || !payload.date) {
      setError('Preencha descrição, valor e data.');
      return;
    }

    try {
      setSaving(true);
      if (transactionType === 'income') {
        await transactionService.createIncome(
          payload.categoryId,
          payload.description,
          payload.amount,
          payload.date,
          false,
          null
        );
      } else {
        await transactionService.createExpense(
          payload.categoryId,
          payload.description,
          payload.amount,
          payload.date,
          formData.paymentMethod,
          false,
          null,
          1
        );
      }

      setSuccess('Transação criada com sucesso.');
      setFormData((prev) => ({
        ...prev,
        description: '',
        amount: '',
      }));
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar transação.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    resetMessages();
    try {
      if (transactionType === 'income') {
        await transactionService.deleteIncome(id);
      } else {
        await transactionService.deleteExpense(id);
      }
      setSuccess('Transação removida com sucesso.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover transação.');
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    resetMessages();

    const name = newCategoryName.trim();
    if (!name) {
      setError('Informe um nome para a categoria.');
      return;
    }

    try {
      setSaving(true);
      await transactionService.createCategory(name, transactionType, '#3b82f6', 'folder');
      setNewCategoryName('');
      setSuccess('Categoria criada com sucesso.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar categoria.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
            <p className="text-gray-600 mt-1">Gerencie suas receitas e despesas</p>
          </div>

          <input
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="border rounded-lg px-3 py-2 bg-white"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTransactionType('expense')}
              className={`px-4 py-2 rounded-lg font-medium ${
                transactionType === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTransactionType('income')}
              className={`px-4 py-2 rounded-lg font-medium ${
                transactionType === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Receitas
            </button>
          </div>

          {(error || success) && (
            <div className={`rounded-lg px-4 py-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <input
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full mt-1 border rounded-lg px-3 py-2"
                placeholder="Ex: Supermercado"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Valor</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(event) => setFormData((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {transactionType === 'expense' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Pagamento</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </form>

          <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row md:items-end gap-3 border-t pt-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Nova categoria ({transactionType === 'income' ? 'receita' : 'despesa'})
              </label>
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2"
                placeholder="Ex: Freelance"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
            >
              Criar categoria
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {transactionType === 'income' ? 'Receitas do período' : 'Despesas do período'}
            </h2>
            <span className={`font-semibold ${transactionType === 'income' ? 'text-green-700' : 'text-red-700'}`}>
              Total: {currencyFormatter.format(totalAmount)}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500">Carregando transações...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">Nenhuma transação encontrada nesse período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-sm text-gray-500">Data</th>
                    <th className="py-2 text-sm text-gray-500">Descrição</th>
                    <th className="py-2 text-sm text-gray-500">Categoria</th>
                    {transactionType === 'expense' && <th className="py-2 text-sm text-gray-500">Pagamento</th>}
                    <th className="py-2 text-sm text-gray-500">Valor</th>
                    <th className="py-2 text-sm text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-b-0">
                      <td className="py-3">{transaction.date}</td>
                      <td className="py-3">{transaction.description}</td>
                      <td className="py-3">{transaction.category_name}</td>
                      {transactionType === 'expense' && <td className="py-3">{transaction.payment_method || '-'}</td>}
                      <td className="py-3 font-semibold">{currencyFormatter.format(Number(transaction.amount || 0))}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export function CreditCardsPage() {
  const [cards, setCards] = React.useState([]);
  const [selectedCardId, setSelectedCardId] = React.useState('');
  const [selectedCardDetails, setSelectedCardDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [savingCard, setSavingCard] = React.useState(false);
  const [savingTransaction, setSavingTransaction] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [cardForm, setCardForm] = React.useState({
    name: '',
    cardNumber: '',
    bank: '',
    limit: '',
    closingDay: '',
    dueDay: '',
  });
  const [transactionForm, setTransactionForm] = React.useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    installments: 1,
  });

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadCards = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await creditCardService.getCards();
      const cardsData = response.data || [];
      setCards(cardsData);

      if (!cardsData.length) {
        setSelectedCardId('');
        setSelectedCardDetails(null);
        return;
      }

      const selectedStillExists = cardsData.some((card) => String(card.id) === String(selectedCardId));
      const nextCardId = selectedStillExists ? selectedCardId : String(cardsData[0].id);
      setSelectedCardId(nextCardId);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os cartões.');
    } finally {
      setLoading(false);
    }
  }, [selectedCardId]);

  const loadCardDetails = React.useCallback(async (cardId) => {
    if (!cardId) {
      setSelectedCardDetails(null);
      return;
    }

    try {
      const response = await creditCardService.getCardDetails(cardId);
      setSelectedCardDetails(response.data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os detalhes do cartão.');
    }
  }, []);

  React.useEffect(() => {
    loadCards();
  }, [loadCards]);

  React.useEffect(() => {
    loadCardDetails(selectedCardId);
  }, [selectedCardId, loadCardDetails]);

  const handleCreateCard = async (event) => {
    event.preventDefault();
    clearMessages();

    const payload = {
      name: cardForm.name.trim(),
      cardNumber: cardForm.cardNumber.trim(),
      bank: cardForm.bank.trim(),
      limit: Number(cardForm.limit),
      closingDay: Number(cardForm.closingDay),
      dueDay: Number(cardForm.dueDay),
    };

    if (!payload.name || !payload.bank || !payload.limit) {
      setError('Preencha nome, banco e limite do cartão.');
      return;
    }

    try {
      setSavingCard(true);
      const createResponse = await creditCardService.createCard(
        payload.name,
        payload.cardNumber || null,
        payload.bank,
        payload.limit,
        payload.closingDay || null,
        payload.dueDay || null
      );

      setSuccess('Cartão criado com sucesso!');
      setCardForm({
        name: '',
        cardNumber: '',
        bank: '',
        limit: '',
        closingDay: '',
        dueDay: '',
      });
      await loadCards();
      const newCardId = createResponse?.data?.id;
      if (newCardId) setSelectedCardId(String(newCardId));
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar o cartão.');
    } finally {
      setSavingCard(false);
    }
  };

  const handleAddCardTransaction = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!selectedCardId) {
      setError('Selecione um cartão antes de adicionar uma compra.');
      return;
    }

    const payload = {
      description: transactionForm.description.trim(),
      amount: Number(transactionForm.amount),
      date: transactionForm.date,
      installments: Number(transactionForm.installments || 1),
    };

    if (!payload.description || !payload.amount || !payload.date) {
      setError('Preencha descrição, valor e data da compra.');
      return;
    }

    try {
      setSavingTransaction(true);
      await creditCardService.addTransaction(
        selectedCardId,
        null,
        payload.description,
        payload.amount,
        payload.date,
        payload.installments
      );
      setSuccess('Compra lançada na fatura com sucesso!');
      setTransactionForm({
        description: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        installments: 1,
      });
      await loadCardDetails(selectedCardId);
    } catch (err) {
      console.error(err);
      setError('Não foi possível adicionar a compra no cartão.');
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleDeactivateCard = async () => {
    clearMessages();
    if (!selectedCardId) return;

    try {
      await creditCardService.deactivateCard(selectedCardId);
      setSuccess('Cartão desativado com sucesso.');
      await loadCards();
    } catch (err) {
      console.error(err);
      setError('Não foi possível desativar o cartão.');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-gray-600 mt-1">Controle seus cartões e faturas</p>
        </div>

        {(error || success) && (
          <div className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</p>}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Novo cartão</h2>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">
                  Nome do cartão
                  <input
                    value={cardForm.name}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    placeholder="Ex: Cartão Principal"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-700">
                  Banco
                  <input
                    value={cardForm.bank}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, bank: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    placeholder="Ex: Nubank"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-700">
                  Número (opcional)
                  <input
                    value={cardForm.cardNumber}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    placeholder="**** **** **** 1234"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="block text-sm text-gray-700">
                  Limite
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cardForm.limit}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, limit: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Fechamento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardForm.closingDay}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, closingDay: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Vencimento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardForm.dueDay}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, dueDay: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={savingCard}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                {savingCard ? 'Salvando...' : 'Criar cartão'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-3 items-end justify-between">
                <div>
                  <label className="block text-sm text-gray-600">Cartão selecionado</label>
                  <select
                    value={selectedCardId}
                    onChange={(event) => setSelectedCardId(event.target.value)}
                    className="mt-1 border rounded-lg px-3 py-2 min-w-72"
                  >
                    {cards.length === 0 && <option value="">Nenhum cartão cadastrado</option>}
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} - {card.bank}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleDeactivateCard}
                  disabled={!selectedCardId}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Desativar cartão
                </button>
              </div>

              {loading ? (
                <p className="text-gray-500 mt-4">Carregando cartões...</p>
              ) : selectedCardDetails ? (
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="rounded-lg bg-gray-50 p-4 border">
                    <p className="text-sm text-gray-500">Limite total</p>
                    <p className="text-xl font-bold text-gray-900">{currencyFormatter.format(Number(selectedCardDetails.limit || 0))}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 border">
                    <p className="text-sm text-gray-500">Fatura atual</p>
                    <p className="text-xl font-bold text-orange-700">{currencyFormatter.format(Number(selectedCardDetails.currentBill || 0))}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 border">
                    <p className="text-sm text-gray-500">Limite disponível</p>
                    <p className="text-xl font-bold text-green-700">{currencyFormatter.format(Number(selectedCardDetails.availableLimit || 0))}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 mt-4">Cadastre um cartão para acompanhar as faturas.</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Lançar compra no cartão</h2>
              <form onSubmit={handleAddCardTransaction} className="grid md:grid-cols-4 gap-3">
                <label className="text-sm text-gray-700 md:col-span-2">
                  Descrição
                  <input
                    value={transactionForm.description}
                    onChange={(event) => setTransactionForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                    placeholder="Ex: Supermercado"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Valor
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Parcelas
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={transactionForm.installments}
                    onChange={(event) => setTransactionForm((prev) => ({ ...prev, installments: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Data
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(event) => setTransactionForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    disabled={savingTransaction || !selectedCardId}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
                  >
                    {savingTransaction ? 'Salvando...' : 'Adicionar compra'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Compras da fatura</h2>
              {!selectedCardDetails?.transactions?.length ? (
                <p className="text-gray-500">Sem compras lançadas para este cartão.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-sm text-gray-500">Data</th>
                        <th className="py-2 text-sm text-gray-500">Descrição</th>
                        <th className="py-2 text-sm text-gray-500">Parcelas</th>
                        <th className="py-2 text-sm text-gray-500">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCardDetails.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b last:border-b-0">
                          <td className="py-3">{transaction.date}</td>
                          <td className="py-3">{transaction.description}</td>
                          <td className="py-3">{transaction.installments || 1}x</td>
                          <td className="py-3 font-semibold">{currencyFormatter.format(Number(transaction.amount || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export function InvestmentsPage() {
  const [investments, setInvestments] = React.useState([]);
  const [selectedInvestmentId, setSelectedInvestmentId] = React.useState('');
  const [selectedInvestment, setSelectedInvestment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'stocks',
    initialAmount: '',
    description: '',
  });
  const [contributionData, setContributionData] = React.useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [currentValue, setCurrentValue] = React.useState('');

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadInvestments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await investmentService.getInvestments();
      const list = response.data || [];
      setInvestments(list);

      if (!list.length) {
        setSelectedInvestmentId('');
        setSelectedInvestment(null);
        return;
      }

      const hasCurrentSelection = list.some((investment) => investment.id === Number(selectedInvestmentId));
      const nextSelectedId = hasCurrentSelection ? Number(selectedInvestmentId) : list[0].id;
      setSelectedInvestmentId(String(nextSelectedId));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os investimentos.');
    } finally {
      setLoading(false);
    }
  }, [selectedInvestmentId]);

  const loadInvestmentDetails = React.useCallback(async (id) => {
    if (!id) {
      setSelectedInvestment(null);
      return;
    }

    try {
      const response = await investmentService.getInvestmentDetails(id);
      const details = response.data;
      setSelectedInvestment(details);
      setCurrentValue(details.current_amount ?? '');
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os detalhes do investimento.');
    }
  }, []);

  React.useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  React.useEffect(() => {
    if (selectedInvestmentId) {
      loadInvestmentDetails(selectedInvestmentId);
    } else {
      setSelectedInvestment(null);
    }
  }, [selectedInvestmentId, loadInvestmentDetails]);

  const handleCreateInvestment = async (event) => {
    event.preventDefault();
    resetMessages();

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      initialAmount: Number(formData.initialAmount),
      description: formData.description.trim(),
    };

    if (!payload.name || !payload.type || !payload.initialAmount) {
      setError('Preencha nome, tipo e valor inicial.');
      return;
    }

    try {
      setSaving(true);
      await investmentService.createInvestment(
        payload.name,
        payload.type,
        payload.initialAmount,
        payload.description || null
      );
      setSuccess('Investimento criado com sucesso.');
      setFormData({
        name: '',
        type: 'stocks',
        initialAmount: '',
        description: '',
      });
      await loadInvestments();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar investimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContribution = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!selectedInvestmentId) {
      setError('Selecione um investimento.');
      return;
    }

    const amount = Number(contributionData.amount);
    if (!amount || !contributionData.date) {
      setError('Informe valor e data do aporte.');
      return;
    }

    try {
      setSaving(true);
      await investmentService.addContribution(selectedInvestmentId, amount, contributionData.date);
      setSuccess('Aporte adicionado com sucesso.');
      setContributionData((prev) => ({ ...prev, amount: '' }));
      await loadInvestments();
      await loadInvestmentDetails(selectedInvestmentId);
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar aporte.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateValue = async (event) => {
    event.preventDefault();
    resetMessages();

    if (!selectedInvestmentId) {
      setError('Selecione um investimento.');
      return;
    }

    const newValue = Number(currentValue);
    if (Number.isNaN(newValue) || newValue < 0) {
      setError('Informe um valor atual válido.');
      return;
    }

    try {
      setSaving(true);
      await investmentService.updateInvestmentValue(selectedInvestmentId, newValue);
      setSuccess('Valor atualizado com sucesso.');
      await loadInvestments();
      await loadInvestmentDetails(selectedInvestmentId);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar valor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvestment = async () => {
    resetMessages();
    if (!selectedInvestmentId) return;

    try {
      setSaving(true);
      await investmentService.deleteInvestment(selectedInvestmentId);
      setSuccess('Investimento removido com sucesso.');
      await loadInvestments();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover investimento.');
    } finally {
      setSaving(false);
    }
  };

  const totalInvested = investments.reduce((acc, investment) => acc + Number(investment.current_amount || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus investimentos</p>
        </div>

        {(error || success) && (
          <div className={`rounded-lg px-4 py-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo</h2>
            {loading ? (
              <p className="text-gray-500">Carregando investimentos...</p>
            ) : !investments.length ? (
              <p className="text-gray-500">Nenhum investimento cadastrado.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Total investido: <span className="font-bold text-gray-900">{currencyFormatter.format(totalInvested)}</span>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-sm text-gray-500">Nome</th>
                        <th className="py-2 text-sm text-gray-500">Tipo</th>
                        <th className="py-2 text-sm text-gray-500">Valor atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment) => (
                        <tr
                          key={investment.id}
                          onClick={() => setSelectedInvestmentId(String(investment.id))}
                          className={`border-b last:border-b-0 cursor-pointer ${
                            String(investment.id) === selectedInvestmentId ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="py-3">{investment.name}</td>
                          <td className="py-3 capitalize">{investment.type}</td>
                          <td className="py-3 font-semibold">{currencyFormatter.format(Number(investment.current_amount || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Novo investimento</h2>
            <form onSubmit={handleCreateInvestment} className="space-y-3">
              <label className="text-sm text-gray-700 block">
                Nome
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  placeholder="Ex: Tesouro Selic"
                />
              </label>
              <label className="text-sm text-gray-700 block">
                Tipo
                <select
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                >
                  <option value="stocks">Ações</option>
                  <option value="fixed_income">Renda fixa</option>
                  <option value="crypto">Cripto</option>
                  <option value="funds">Fundos</option>
                  <option value="other">Outros</option>
                </select>
              </label>
              <label className="text-sm text-gray-700 block">
                Valor inicial
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.initialAmount}
                  onChange={(event) => setFormData((prev) => ({ ...prev, initialAmount: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700 block">
                Descrição
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  rows="3"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Cadastrar investimento'}
              </button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Detalhes do investimento</h2>
            {!selectedInvestment ? (
              <p className="text-gray-500">Selecione um investimento para ver os detalhes.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3 border">
                    <p className="text-sm text-gray-500">Valor inicial</p>
                    <p className="text-lg font-bold text-gray-900">{currencyFormatter.format(Number(selectedInvestment.initial_amount || 0))}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 border">
                    <p className="text-sm text-gray-500">Valor atual</p>
                    <p className="text-lg font-bold text-blue-700">{currencyFormatter.format(Number(selectedInvestment.current_amount || 0))}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 border">
                    <p className="text-sm text-gray-500">Total aportado</p>
                    <p className="text-lg font-bold text-gray-900">{currencyFormatter.format(Number(selectedInvestment.totalContributed || 0))}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 border">
                    <p className="text-sm text-gray-500">Rentabilidade</p>
                    <p className={`text-lg font-bold ${Number(selectedInvestment.profitLoss || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {currencyFormatter.format(Number(selectedInvestment.profitLoss || 0))} ({Number(selectedInvestment.profitLossPercentage || 0).toFixed(2)}%)
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateValue} className="grid md:grid-cols-3 gap-3">
                  <label className="text-sm text-gray-700 md:col-span-2">
                    Atualizar valor atual
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentValue}
                      onChange={(event) => setCurrentValue(event.target.value)}
                      className="w-full mt-1 border rounded-lg px-3 py-2"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                      Atualizar
                    </button>
                  </div>
                </form>

                <button
                  type="button"
                  onClick={handleDeleteInvestment}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  Excluir investimento
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Registrar aporte</h2>
            <form onSubmit={handleAddContribution} className="space-y-3">
              <label className="text-sm text-gray-700 block">
                Valor do aporte
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={contributionData.amount}
                  onChange={(event) => setContributionData((prev) => ({ ...prev, amount: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-700 block">
                Data
                <input
                  type="date"
                  value={contributionData.date}
                  onChange={(event) => setContributionData((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={saving || !selectedInvestmentId}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                Adicionar aporte
              </button>
            </form>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Histórico de aportes</h3>
              {!selectedInvestment?.contributions?.length ? (
                <p className="text-sm text-gray-500">Sem aportes registrados.</p>
              ) : (
                <ul className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedInvestment.contributions.map((contribution) => (
                    <li key={contribution.id} className="border rounded-lg px-3 py-2 text-sm flex justify-between">
                      <span>{contribution.date}</span>
                      <span className="font-semibold">{currencyFormatter.format(Number(contribution.amount || 0))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export function GoalsPage() {
  const [goals, setGoals] = React.useState([]);
  const [selectedGoalId, setSelectedGoalId] = React.useState('');
  const [selectedGoalDetails, setSelectedGoalDetails] = React.useState(null);
  const [emergencyFund, setEmergencyFund] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [goalForm, setGoalForm] = React.useState({
    name: '',
    description: '',
    goalAmount: '',
    frequency: 'monthly',
    targetDate: '',
  });
  const [progressAmount, setProgressAmount] = React.useState('');
  const [emergencyTarget, setEmergencyTarget] = React.useState('');
  const [emergencyContribution, setEmergencyContribution] = React.useState('');
  const [monthsOfExpenses, setMonthsOfExpenses] = React.useState(3);
  const [suggestion, setSuggestion] = React.useState(null);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadGoals = React.useCallback(async () => {
    const response = await goalsService.getGoals();
    const list = response.data || [];
    setGoals(list);

    if (!list.length) {
      setSelectedGoalId('');
      setSelectedGoalDetails(null);
      return;
    }

    const hasCurrent = list.some((goal) => String(goal.id) === String(selectedGoalId));
    const nextId = hasCurrent ? String(selectedGoalId) : String(list[0].id);
    setSelectedGoalId(nextId);
  }, [selectedGoalId]);

  const loadGoalDetails = React.useCallback(async (goalId) => {
    if (!goalId) {
      setSelectedGoalDetails(null);
      return;
    }

    const response = await goalsService.getGoalDetails(goalId);
    setSelectedGoalDetails(response.data);
  }, []);

  const loadEmergencyFund = React.useCallback(async () => {
    try {
      const response = await goalsService.getEmergencyFund();
      setEmergencyFund(response.data);
      setEmergencyTarget(response.data?.target_amount ? String(response.data.target_amount) : '');
    } catch (err) {
      if (err.response?.status === 404) {
        setEmergencyFund(null);
        return;
      }

      throw err;
    }
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      clearMessages();
      await Promise.all([loadGoals(), loadEmergencyFund()]);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as metas.');
    } finally {
      setLoading(false);
    }
  }, [loadGoals, loadEmergencyFund]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const run = async () => {
      try {
        await loadGoalDetails(selectedGoalId);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os detalhes da meta.');
      }
    };

    run();
  }, [selectedGoalId, loadGoalDetails]);

  const handleCreateGoal = async (event) => {
    event.preventDefault();
    clearMessages();

    const payload = {
      name: goalForm.name.trim(),
      description: goalForm.description.trim(),
      goalAmount: Number(goalForm.goalAmount),
      frequency: goalForm.frequency,
      targetDate: goalForm.targetDate || null,
    };

    if (!payload.name || !payload.goalAmount) {
      setError('Preencha nome e valor da meta.');
      return;
    }

    try {
      setSaving(true);
      await goalsService.createGoal(
        payload.name,
        payload.description || null,
        payload.goalAmount,
        payload.frequency,
        payload.targetDate
      );
      setSuccess('Meta criada com sucesso.');
      setGoalForm({
        name: '',
        description: '',
        goalAmount: '',
        frequency: 'monthly',
        targetDate: '',
      });
      await loadGoals();
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar a meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProgress = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!selectedGoalId) {
      setError('Selecione uma meta para registrar progresso.');
      return;
    }

    const amount = Number(progressAmount);
    if (!amount || amount <= 0) {
      setError('Informe um valor válido para o progresso.');
      return;
    }

    try {
      setSaving(true);
      await goalsService.updateGoalProgress(selectedGoalId, amount);
      setSuccess('Progresso atualizado com sucesso.');
      setProgressAmount('');
      await loadGoals();
      await loadGoalDetails(selectedGoalId);
    } catch (err) {
      console.error(err);
      setError('Não foi possível atualizar o progresso da meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    clearMessages();
    if (!selectedGoalId) return;

    try {
      setSaving(true);
      await goalsService.deleteGoal(selectedGoalId);
      setSuccess('Meta removida com sucesso.');
      await loadGoals();
    } catch (err) {
      console.error(err);
      setError('Não foi possível remover a meta.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEmergencyFund = async (event) => {
    event.preventDefault();
    clearMessages();

    const target = Number(emergencyTarget);
    if (!target || target <= 0) {
      setError('Informe um valor alvo válido para a reserva.');
      return;
    }

    try {
      setSaving(true);
      await goalsService.createEmergencyFund(target);
      setSuccess('Reserva de emergência criada com sucesso.');
      await loadEmergencyFund();
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar a reserva de emergência.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmergencyTarget = async (event) => {
    event.preventDefault();
    clearMessages();

    const target = Number(emergencyTarget);
    if (!target || target <= 0) {
      setError('Informe um valor alvo válido.');
      return;
    }

    try {
      setSaving(true);
      await goalsService.updateEmergencyFundTarget(target);
      setSuccess('Meta da reserva atualizada com sucesso.');
      await loadEmergencyFund();
    } catch (err) {
      console.error(err);
      setError('Não foi possível atualizar o alvo da reserva.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmergencyContribution = async (event) => {
    event.preventDefault();
    clearMessages();

    const amount = Number(emergencyContribution);
    if (!amount || amount <= 0) {
      setError('Informe um valor de aporte válido.');
      return;
    }

    try {
      setSaving(true);
      await goalsService.addToEmergencyFund(amount);
      setEmergencyContribution('');
      setSuccess('Aporte registrado na reserva de emergência.');
      await loadEmergencyFund();
    } catch (err) {
      console.error(err);
      setError('Não foi possível adicionar aporte na reserva.');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateSuggestion = async () => {
    clearMessages();
    try {
      const response = await goalsService.calculateEmergencyFundSuggestion(monthsOfExpenses);
      setSuggestion(Number(response.data?.suggestion || 0));
      setSuccess('Sugestão calculada com base nas despesas recentes.');
      await loadEmergencyFund();
    } catch (err) {
      console.error(err);
      setError('Não foi possível calcular a sugestão da reserva.');
    }
  };

  const totalPlanned = goals.reduce((acc, goal) => acc + Number(goal.goal_amount || 0), 0);
  const totalCurrent = goals.reduce((acc, goal) => acc + Number(goal.current_amount || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-600 mt-1">Crie e acompanhe suas metas</p>
        </div>

        {(error || success) && (
          <div className={`rounded-lg px-4 py-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border">
            <p className="text-sm text-gray-500">Total planejado em metas</p>
            <p className="text-2xl font-bold text-gray-900">{currencyFormatter.format(totalPlanned)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border">
            <p className="text-sm text-gray-500">Total já acumulado</p>
            <p className="text-2xl font-bold text-blue-700">{currencyFormatter.format(totalCurrent)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border">
            <p className="text-sm text-gray-500">Reserva de emergência</p>
            <p className="text-2xl font-bold text-green-700">
              {currencyFormatter.format(Number(emergencyFund?.current_amount || 0))}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nova meta</h2>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <label className="block text-sm text-gray-700">
                Nome
                <input
                  value={goalForm.name}
                  onChange={(event) => setGoalForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  placeholder="Ex: Viagem de férias"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Descrição
                <textarea
                  value={goalForm.description}
                  onChange={(event) => setGoalForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                  rows="3"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm text-gray-700">
                  Valor alvo
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goalForm.goalAmount}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, goalAmount: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Frequência
                  <select
                    value={goalForm.frequency}
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, frequency: event.target.value }))}
                    className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm text-gray-700">
                Data alvo (opcional)
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(event) => setGoalForm((prev) => ({ ...prev, targetDate: event.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Criar meta'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Metas cadastradas</h2>
              {loading ? (
                <p className="text-gray-500">Carregando metas...</p>
              ) : !goals.length ? (
                <p className="text-gray-500">Nenhuma meta cadastrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const progress = Number(goal.goal_amount) > 0
                      ? Math.min(100, (Number(goal.current_amount || 0) / Number(goal.goal_amount)) * 100)
                      : 0;

                    return (
                      <button
                        type="button"
                        key={goal.id}
                        onClick={() => setSelectedGoalId(String(goal.id))}
                        className={`w-full text-left border rounded-lg p-4 transition ${
                          String(goal.id) === selectedGoalId ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{goal.name}</p>
                            <p className="text-sm text-gray-500">
                              {goal.target_date ? `Meta para ${goal.target_date}` : 'Sem data alvo definida'}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">{currencyFormatter.format(Number(goal.goal_amount || 0))}</p>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {currencyFormatter.format(Number(goal.current_amount || 0))} acumulado ({progress.toFixed(1)}%)
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Detalhes e progresso da meta</h2>
              {!selectedGoalDetails ? (
                <p className="text-gray-500">Selecione uma meta para visualizar os detalhes.</p>
              ) : (
                <>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3 border">
                      <p className="text-sm text-gray-500">Objetivo</p>
                      <p className="text-lg font-bold text-gray-900">
                        {currencyFormatter.format(Number(selectedGoalDetails.goal_amount || 0))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 border">
                      <p className="text-sm text-gray-500">Atual</p>
                      <p className="text-lg font-bold text-blue-700">
                        {currencyFormatter.format(Number(selectedGoalDetails.current_amount || 0))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 border">
                      <p className="text-sm text-gray-500">Falta</p>
                      <p className="text-lg font-bold text-orange-700">
                        {currencyFormatter.format(Number(selectedGoalDetails.remainingAmount || 0))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 border">
                      <p className="text-sm text-gray-500">Prazo restante</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedGoalDetails.daysRemaining ?? '-'} dias
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddProgress} className="grid md:grid-cols-4 gap-3">
                    <label className="md:col-span-2 text-sm text-gray-700">
                      Registrar aporte na meta
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={progressAmount}
                        onChange={(event) => setProgressAmount(event.target.value)}
                        className="w-full mt-1 border rounded-lg px-3 py-2"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                      >
                        Adicionar progresso
                      </button>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleDeleteGoal}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                      >
                        Remover meta
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reserva de emergência</h2>
            <p className="text-sm text-gray-600 mt-1">
              Defina um objetivo, registre aportes e calcule uma sugestão com base nas despesas da família.
            </p>
          </div>

          {!emergencyFund ? (
            <form onSubmit={handleCreateEmergencyFund} className="flex flex-col md:flex-row gap-3 md:items-end">
              <label className="text-sm text-gray-700 flex-1">
                Valor alvo da reserva
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={emergencyTarget}
                  onChange={(event) => setEmergencyTarget(event.target.value)}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                Criar reserva
              </button>
            </form>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-4 border">
                  <p className="text-sm text-gray-500">Valor atual</p>
                  <p className="text-xl font-bold text-green-700">
                    {currencyFormatter.format(Number(emergencyFund.current_amount || 0))}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 border">
                  <p className="text-sm text-gray-500">Meta da reserva</p>
                  <p className="text-xl font-bold text-gray-900">
                    {currencyFormatter.format(Number(emergencyFund.target_amount || 0))}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 border">
                  <p className="text-sm text-gray-500">Sugestão mensal</p>
                  <p className="text-xl font-bold text-blue-700">
                    {currencyFormatter.format(Number(emergencyFund.monthly_suggestion || 0))}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <form onSubmit={handleUpdateEmergencyTarget} className="space-y-2 border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">Atualizar alvo da reserva</h3>
                  <label className="text-sm text-gray-700 block">
                    Novo valor alvo
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={emergencyTarget}
                      onChange={(event) => setEmergencyTarget(event.target.value)}
                      className="w-full mt-1 border rounded-lg px-3 py-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
                  >
                    Atualizar meta
                  </button>
                </form>

                <form onSubmit={handleAddEmergencyContribution} className="space-y-2 border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">Adicionar aporte</h3>
                  <label className="text-sm text-gray-700 block">
                    Valor do aporte
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={emergencyContribution}
                      onChange={(event) => setEmergencyContribution(event.target.value)}
                      className="w-full mt-1 border rounded-lg px-3 py-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Calcular sugestão baseada em despesas</h3>
                <div className="flex flex-col md:flex-row gap-3 md:items-end">
                  <label className="text-sm text-gray-700">
                    Meses de despesas
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={monthsOfExpenses}
                      onChange={(event) => setMonthsOfExpenses(Number(event.target.value))}
                      className="mt-1 border rounded-lg px-3 py-2 w-36"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleCalculateSuggestion}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Calcular sugestão
                  </button>
                  {suggestion !== null && (
                    <p className="text-sm text-gray-700">
                      Última sugestão calculada: <span className="font-semibold">{currencyFormatter.format(suggestion)}</span>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [newUser, setNewUser] = React.useState({ name: '', email: '', password: '', role: 'member' });

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getFamilyUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    try {
      setSaving(true);
      setError('');
      await authService.createFamilyUser(newUser.name, newUser.email, newUser.password, newUser.role);
      setSuccess('Usuário criado com sucesso.');
      setNewUser({ name: '', email: '', password: '', role: 'member' });
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao criar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserFieldChange = (id, field, value) => {
    if (!isAdmin) return;
    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveUser = async (targetUser) => {
    if (!isAdmin) return;

    try {
      setSaving(true);
      setError('');
      await authService.updateFamilyUser(targetUser.id, {
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        is_active: !!targetUser.is_active,
      });
      setSuccess('Usuário atualizado com sucesso.');
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao atualizar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(`Deseja realmente excluir o usuário "${targetUser.name}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await authService.deleteFamilyUser(targetUser.id);
      setSuccess('Usuário removido com sucesso.');
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao remover usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Preencha todos os campos para alterar a senha.');
      setSuccess('');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      setSuccess('');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Senha alterada com sucesso.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao alterar senha.');
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de usuários da família</p>
        </div>

        {(error || success) && (
          <div className={`rounded-lg px-4 py-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Alterar minha senha</h2>
          <p className="text-sm text-gray-600">
            Atualize sua senha de acesso utilizando a senha atual.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="password"
              className="border rounded-lg px-3 py-2"
              placeholder="Senha atual"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
            <input
              type="password"
              className="border rounded-lg px-3 py-2"
              placeholder="Nova senha"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              minLength={6}
              required
            />
            <input
              type="password"
              className="border rounded-lg px-3 py-2"
              placeholder="Confirmar nova senha"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              Alterar senha
            </button>
          </div>
        </form>

        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3">
            Apenas o usuário admin pode editar usuários.
          </div>
        )}

        {isAdmin && (
          <form onSubmit={handleCreateUser} className="bg-white rounded-lg shadow p-6 grid md:grid-cols-4 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))} required />
            <input type="email" className="border rounded-lg px-3 py-2" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} required />
            <input type="password" className="border rounded-lg px-3 py-2" placeholder="Senha inicial" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} required />
            <div className="flex gap-2">
              <select className="border rounded-lg px-3 py-2 flex-1" value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}>
                <option value="member">Membro</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">Criar</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-600">Carregando usuários...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Perfil</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        className="border rounded-lg px-2 py-1 w-full disabled:bg-gray-100"
                        value={item.name}
                        onChange={(e) => handleUserFieldChange(item.id, 'name', e.target.value)}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="border rounded-lg px-2 py-1 w-full disabled:bg-gray-100"
                        value={item.email}
                        onChange={(e) => handleUserFieldChange(item.id, 'email', e.target.value)}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="border rounded-lg px-2 py-1 disabled:bg-gray-100"
                        value={item.role}
                        onChange={(e) => handleUserFieldChange(item.id, 'role', e.target.value)}
                        disabled={!isAdmin}
                      >
                        <option value="member">Membro</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!item.is_active}
                          onChange={(e) => handleUserFieldChange(item.id, 'is_active', e.target.checked)}
                          disabled={!isAdmin}
                        />
                        <span>{item.is_active ? 'Ativo' : 'Inativo'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleSaveUser(item)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-60"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(item)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
