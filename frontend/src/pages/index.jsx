import React from 'react';
import { MainLayout } from '../components/Layout.jsx';
import { creditCardService, transactionService } from '../services/index.js';
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
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus investimentos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">
              Funcionalidade de investimentos em desenvolvimento...
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export function GoalsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-600 mt-1">Crie e acompanhe suas metas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">
              Funcionalidade de metas em desenvolvimento...
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
