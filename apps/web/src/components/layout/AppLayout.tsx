import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import s from './Layout.module.css';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={s.shell}>
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {mobileOpen && (
        <div className={s.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}
      <div className={s.main}>
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
