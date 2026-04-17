import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import { StatsPage } from './pages/Stats/StatsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { AdminPage } from './pages/Admin/AdminPage';
import { PrivacidadPage } from './pages/Legal/PrivacidadPage';
import { TerminosPage } from './pages/Legal/TerminosPage';
import { AppLayout } from './components/layout/AppLayout';
import { ExamenesPage } from './pages/Examenes/ExamenesPage';
import { ExamenDetallePage } from './pages/Examenes/ExamenDetallePage';
import { ExamDocDetailPage } from './pages/Examenes/ExamDocDetailPage';
import { ErroresPage } from './pages/Errores/ErroresPage';
import { FlashcardsPage } from './pages/Flashcards/FlashcardsPage';
import { FavoritosPage } from './pages/Favoritos/FavoritosPage';
import { SimulacrosPage } from './pages/Simulacros/SimulacrosPage';
import { QuestionWorkspace } from './pages/Workspace';
import { CommunityPage } from './pages/Community/CommunityPage';

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
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<SessionReviewPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:id" element={<PostDetailPage />} />
          <Route path="/forum/new" element={<CreatePostPage />} />
          <Route path="/comunidad/*" element={<CommunityPage />} />
          <Route path="/examenes" element={<ExamenesPage />} />
          <Route path="/examenes/doc/:id" element={<ExamDocDetailPage />} />
          <Route path="/examenes/:key" element={<ExamenDetallePage />} />
          <Route path="/errores" element={<ErroresPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/simulacros" element={<SimulacrosPage />} />
        </Route>

        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/workspace" element={<PrivateRoute><QuestionWorkspace /></PrivateRoute>} />
        <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
