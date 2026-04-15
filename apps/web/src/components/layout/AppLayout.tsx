import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import s from './Layout.module.css';

export function AppLayout() {
  return (
    <div className={s.appRoot}>
      <TopNav />
      <main className={s.pageContent}>
        <Outlet />
      </main>
    </div>
  );
}
