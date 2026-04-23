import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import s from './Layout.module.css';

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  return (
    <div className={s.shell}>
      <AppSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className={s.main}>
        <AppTopbar onMobileMenu={() => setMobileNavOpen((v) => !v)} />
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
      {mobileNavOpen && (
        <div
          className={s.mobileBackdrop}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
