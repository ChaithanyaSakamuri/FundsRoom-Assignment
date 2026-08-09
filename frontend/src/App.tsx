import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { authApi } from './services/api';

import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerListPage } from './pages/customers/CustomerListPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { CustomerFormPage } from './pages/customers/CustomerFormPage';
import { InventoryListPage } from './pages/inventory/InventoryListPage';
import { ProductDetailPage } from './pages/inventory/ProductDetailPage';
import { ProductFormPage } from './pages/inventory/ProductFormPage';
import { StockMovementPage } from './pages/stock-movements/StockMovementPage';
import { ChallanListPage } from './pages/challans/ChallanListPage';
import { ChallanWizardPage } from './pages/challans/ChallanWizardPage';
import { ChallanDetailPage } from './pages/challans/ChallanDetailPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = () => {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nexora_token');
      if (!token) {
        setChecking(false);
        return;
      }
      if (!user) {
        try {
          const u = await authApi.me();
          setUser(u);
        } catch {
          logout();
        }
      }
      setChecking(false);
    };
    initAuth();
  }, []);

  if (checking) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '0.1em' }}>NEXORA</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem('nexora_token')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="inventory" element={<InventoryListPage />} />
            <Route path="inventory/new" element={<ProductFormPage />} />
            <Route path="inventory/:id" element={<ProductDetailPage />} />
            <Route path="inventory/:id/edit" element={<ProductFormPage />} />
            <Route path="stock-movements" element={<StockMovementPage />} />
            <Route path="challans" element={<ChallanListPage />} />
            <Route path="challans/new" element={<ChallanWizardPage />} />
            <Route path="challans/:id" element={<ChallanDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}