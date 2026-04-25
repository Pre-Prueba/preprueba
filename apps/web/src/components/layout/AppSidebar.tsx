import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, BookMarked, ClipboardList,
  BarChart2, FileText, AlertCircle, Users,
  Settings, LogOut, ChevronRight, Star,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const ESTUDIAR = [
  { to: '/dashboard', label: 'Inicio',     Icon: LayoutDashboard },
  { to: '/practice',  label: 'Practicar',  Icon: Dumbbell },
  { to: '/flashcards', label: 'Flashcards', Icon: BookMarked },
  { to: '/simulacros', label: 'Simulados',  Icon: ClipboardList },
];

const RENDIMIENTO = [
  { to: '/stats',    label: 'Desempeño',    Icon: BarChart2 },
  { to: '/examenes', label: 'Exámenes',     Icon: FileText },
  { to: '/errores',  label: 'Mis errores',  Icon: AlertCircle },
];

const COMUNIDAD = [
  { to: '/comunidad', label: 'Comunidad', Icon: Users },
];

const CONFIGURACION = [
  { to: '/settings', label: 'Configuraciones', Icon: Settings },
];

const NAV_GROUPS = [
  { label: 'ESTUDIAR',      items: ESTUDIAR },
  { label: 'RENDIMIENTO',   items: RENDIMIENTO },
  { label: 'COMUNIDAD',     items: COMUNIDAD },
  { label: 'CONFIGURACIÓN', items: CONFIGURACION },
];

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const { user, subscription, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'UD';

  const isPremium = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className={[s.sidebar, mobileOpen ? s.sidebarMobileOpen : ''].filter(Boolean).join(' ')}>
      {/* Brand */}
      <div className={s.brandBlock}>
        <NavLink to="/dashboard" className={s.brand} onClick={onClose}>
          <img src="/assets/icon.png" alt="" aria-hidden className={s.brandMark} />
          <span className={s.brandWord}>preprueba</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className={s.nav}>
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className={s.navGroup}>
            <span className={s.navGroupLabel}>{label}</span>
            <ul className={s.navList}>
              {items.map(({ to, label: itemLabel, Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [s.navItem, isActive ? s.navItemActive : ''].filter(Boolean).join(' ')
                    }
                  >
                    <span className={s.navItemIcon}><Icon size={16} /></span>
                    <span className={s.navItemLabel}>{itemLabel}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <NavLink to="/settings" className={s.userCard} onClick={onClose}>
        <div className={s.userAvatar}>{initials}</div>
        <div className={s.userInfo}>
          <div className={s.userName}>{user?.nombre ?? 'Usuario'}</div>
          <div className={[s.userPlan, isPremium ? s.userPlanPremium : ''].filter(Boolean).join(' ')}>
            {isPremium ? <><Star size={10} style={{ display: 'inline', marginRight: 3 }} />Premium</> : 'Plan gratuito'}
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
      </NavLink>

      {/* Footer */}
      <div className={s.sidebarFooter}>
        <button className={s.navItemFooter} onClick={handleLogout}>
          <span className={s.navItemIcon}><LogOut size={16} /></span>
          <span className={s.navItemLabel}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
