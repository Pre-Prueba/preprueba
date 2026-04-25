import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useTheme } from '../../hooks/useTheme';
import s from './Layout.module.css';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('preprueba-theme') as 'light' | 'dark' | null;
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={s.shell}>
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen && (
        <div className={s.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}
      <div className={s.main}>
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className={s.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
