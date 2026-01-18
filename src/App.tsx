import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { Layout } from './app/Layout';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-dark-600 dark:text-dark-400">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Import pages
import { StocksPage } from './features/stocks/StocksPage';
import { PricesPage } from './features/prices/PricesPage';
import { CalculatorPage } from './features/calculator/CalculatorPage';
import { TimersPage } from './features/timers/TimersPage';
import { HistoryPage } from './features/history/HistoryPage';
import { SetupPage } from './features/setup/SetupPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-dark-600 dark:text-dark-400">Chargement...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedRoute>
            <StocksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prices"
        element={
          <ProtectedRoute>
            <PricesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <CalculatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timers"
        element={
          <ProtectedRoute>
            <TimersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <SetupPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
