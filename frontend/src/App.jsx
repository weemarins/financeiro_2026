import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage, TransactionsPage, CreditCardsPage, InvestmentsPage, GoalsPage, UsersPage } from './pages/index.jsx';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/credit-cards"
            element={
              <PrivateRoute>
                <CreditCardsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/investments"
            element={
              <PrivateRoute>
                <InvestmentsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <GoalsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
