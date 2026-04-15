import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CalendarDays,
  BarChart2, MessageSquare, Settings, LogOut, FileText, Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className={s.sidebar}>
      {/* Logo */}
      <div className={s.sidebarLogo}>
        <div className={s.logoMark}>P</div>
        <span className={s.logoText}>prep<em>rueba</em></span>
      </div>

      {/* Nav */}
      <nav className={s.sidebarNav}>
        <NavLink to="/dashboard" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/practice" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <BookOpen size={20} />
          <span>Practicar</span>
        </NavLink>

        <NavLink to="/planner" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <CalendarDays size={20} />
          <span>Planificador</span>
        </NavLink>

        <NavLink to="/stats" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <BarChart2 size={20} />
          <span>Desempeño</span>
        </NavLink>

        <NavLink to="/examenes" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <FileText size={20} />
          <span>Exámenes</span>
        </NavLink>

        <NavLink to="/simulacros" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <Zap size={20} />
          <span>Simulacros</span>
        </NavLink>

        <NavLink to="/forum" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <MessageSquare size={20} />
          <span>Foro</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className={s.sidebarFooter}>
        <NavLink to="/settings" className={({ isActive }) => `${s.sidebarNavItem} ${isActive ? s.sidebarNavItemActive : ''}`}>
          <Settings size={20} />
          <span>Configuración</span>
        </NavLink>

        <button className={s.sidebarLogout} onClick={() => logout()} title="Cerrar sesión" type="button">
          <LogOut size={20} />
          <span>Salir</span>
        </button>

        <div className={s.sidebarUser}>
          <div className={s.userAvatar}>{initials}</div>
          <div className={s.userDetails}>
            <p className={s.userName}>{user?.nombre ?? 'Usuario'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
