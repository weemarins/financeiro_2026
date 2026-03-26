import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/index.js';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target, CreditCard } from 'lucide-react';
import { MainLayout } from '../components/Layout.jsx';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('month');
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    loadDashboardData();
  }, [viewType, selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate, endDate;

      if (viewType === 'month') {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
      } else {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
      }

      startDate = startDate.toISOString().split('T')[0];
      endDate = endDate.toISOString().split('T')[0];

      const response = await dashboardService.getDashboard(startDate, endDate);
      setData(response.data);
    } catch (err) {
      setError('Erro ao carregar dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </MainLayout>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const monthOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentDate.getFullYear() - 5 + index);
  const selectedPeriodLabel = viewType === 'month'
    ? `${monthOptions[selectedMonth]}/${selectedYear}`
    : `${selectedYear}`;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral financeira da família</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewType('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewType('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ano
            </button>

            {viewType === 'month' && (
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700"
              >
                {monthOptions.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Saldo</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  R$ {data?.balance?.toFixed(2) || '0,00'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${data?.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`${data?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <Link to="/transactions?type=income" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Receitas</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  R$ {data?.totalIncomes?.toFixed(2) || '0,00'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="text-green-600" />
              </div>
            </div>
          </Link>

          <Link to="/transactions?type=expense" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Despesas</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  R$ {data?.totalExpenses?.toFixed(2) || '0,00'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingDown className="text-red-600" />
              </div>
            </div>
          </Link>

          <Link to="/investments" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Investimentos</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  R$ {data?.totalInvestments?.toFixed(2) || '0,00'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas por Categoria */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Despesas por Categoria</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.expensesByCategory || []}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Receitas vs Despesas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Receitas vs Despesas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                {
                  name: selectedPeriodLabel,
                  receitas: data?.totalIncomes || 0,
                  despesas: data?.totalExpenses || 0,
                },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" />
                <Bar dataKey="despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cartões de Crédito */}
        {data?.creditCards?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard size={24} />
              <span>Cartões de Crédito</span>
            </h2>
            <div className="space-y-4">
              {data?.creditCards?.map((card) => (
                <div key={card.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{card.name}</p>
                      <p className="text-sm text-gray-500">{card.bank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        R$ {(card.current_usage || 0).toFixed(2)} / R$ {card.limit.toFixed(2)}
                      </p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, ((card.current_usage || 0) / card.limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
