import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/auth';
import { Spinner } from './components/ui/Spinner';
import { Toaster } from 'sonner';

import { LandingPage } from './pages/Landing/index';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { OnboardingPage } from './pages/Onboarding/OnboardingPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { PlannerPage } from './pages/Planner/PlannerPage';
import { HistoryPage } from './pages/History/HistoryPage';
import { SessionReviewPage } from './pages/History/SessionReviewPage';
import { PracticeSetupPage } from './pages/Practice/PracticeSetupPage';
import { ForumPage } from './pages/Forum/ForumPage';
import { PostDetailPage } from './pages/Forum/PostDetailPage';
import { CreatePostPage } from './pages/Forum/CreatePostPage';
import { PracticeHomePage } from './pages/Practice/PracticeHomePage';
import { PracticePage } from './pages/Practice/PracticePage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { PrivacidadPage } from './pages/Legal/PrivacidadPage';
import { TerminosPage } from './pages/Legal/TerminosPage';
import { AppLayout } from './components/layout/AppLayout';
import { ErroresPage } from './pages/Errores/ErroresPage';
import { FavoritosPage } from './pages/Favoritos/FavoritosPage';
import { SimulacrosPage } from './pages/Simulacros/SimulacrosPage';
import { QuestionWorkspace } from './pages/Workspace';
import { CommunityPage } from './pages/Community/CommunityPage';

const StatsPage = lazy(() => import('./pages/Stats/StatsPage').then(m => ({ default: m.StatsPage })));
const FlashcardsPage = lazy(() => import('./pages/Flashcards/FlashcardsPage').then(m => ({ default: m.FlashcardsPage })));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ExamenesPage = lazy(() => import('./pages/Examenes/ExamenesPage').then(m => ({ default: m.ExamenesPage })));
const ExamenDetallePage = lazy(() => import('./pages/Examenes/ExamenDetallePage').then(m => ({ default: m.ExamenDetallePage })));
const ExamDocDetailPage = lazy(() => import('./pages/Examenes/ExamDocDetailPage').then(m => ({ default: m.ExamDocDetailPage })));

function PageSpinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={36} />
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { fetchMe, initialized } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ignore
      });
    }
  }, []);

  if (!initialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
        
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice" element={<PracticeHomePage />} />
          <Route path="/practice/:materiaId" element={<PracticeSetupPage />} />
          <Route path="/practice/:materiaId/session" element={<PracticePage />} />
          <Route path="/stats" element={<Suspense fallback={<PageSpinner />}><StatsPage /></Suspense>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<SessionReviewPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:id" element={<PostDetailPage />} />
          <Route path="/forum/new" element={<CreatePostPage />} />
          <Route path="/comunidad/*" element={<CommunityPage />} />
          <Route path="/examenes" element={<Suspense fallback={<PageSpinner />}><ExamenesPage /></Suspense>} />
          <Route path="/examenes/doc/:id" element={<Suspense fallback={<PageSpinner />}><ExamDocDetailPage /></Suspense>} />
          <Route path="/examenes/:key" element={<Suspense fallback={<PageSpinner />}><ExamenDetallePage /></Suspense>} />
          <Route path="/errores" element={<ErroresPage />} />
          <Route path="/flashcards" element={<Suspense fallback={<PageSpinner />}><FlashcardsPage /></Suspense>} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/simulacros" element={<SimulacrosPage />} />
        </Route>

        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/workspace" element={<PrivateRoute><QuestionWorkspace /></PrivateRoute>} />
        <Route path="/admin" element={<AdminGuard><Suspense fallback={<PageSpinner />}><AdminPage /></Suspense></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
