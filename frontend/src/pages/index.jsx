import React from 'react';
import { MainLayout } from '../components/Layout.jsx';
import { transactionService } from '../services/index.js';
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
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-gray-600 mt-1">Controle seus cartões e faturas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">
              Funcionalidade de cartões em desenvolvimento...
            </p>
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
