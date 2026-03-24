import React from 'react';
import { MainLayout } from '../components/Layout.jsx';

export function TransactionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-1">Gerencie suas receitas e despesas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">
              Funcionalidade de transações em desenvolvimento...
            </p>
          </div>
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
