import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CollectionsPage from '@/pages/CollectionsPage';
import ExpensesPage from '@/pages/ExpensesPage';
import ContributionsPage from '@/pages/ContributionsPage';
import LedgerPage from '@/pages/LedgerPage';
import ReportsPage from '@/pages/ReportsPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated — wrapped in DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/contributions" element={<ContributionsPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </QueryClientProvider>
  );
}