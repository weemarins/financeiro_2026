import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, CreditCard, TrendingUp, Target, Home, Users } from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Transações', icon: BarChart3, path: '/transactions' },
    { label: 'Cartões', icon: CreditCard, path: '/credit-cards' },
    { label: 'Investimentos', icon: TrendingUp, path: '/investments' },
    { label: 'Metas', icon: Target, path: '/goals' },
    { label: 'Usuários', icon: Users, path: '/users' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">💰 Financeiro</h1>
        <p className="text-sm text-gray-400 mt-2">Gestão Familiar</p>
      </div>

      <nav className="mt-10">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center space-x-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="border-t border-gray-800 pt-4 mb-4">
          <p className="text-sm text-gray-400">Usuário</p>
          <p className="font-semibold">{user?.name || 'Usuário'}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

export function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
