import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { Spinner } from './components/ui/Spinner';

import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { OnboardingPage } from './pages/Onboarding/OnboardingPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { PracticePage } from './pages/Practice/PracticePage';
import { StatsPage } from './pages/Stats/StatsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { fetchMe, initialized } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (!initialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice/:materiaId" element={<PracticePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
