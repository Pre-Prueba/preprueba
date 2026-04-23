import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CalendarDays, BarChart3,
  FileText, Sparkles, Users, Layers, Settings, LogOut,
  Zap, Heart, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  group?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard',  label: 'Inicio',       Icon: LayoutDashboard, group: 'ESTUDIAR' },
  { to: '/practice',   label: 'Practicar',    Icon: Zap,             group: 'ESTUDIAR' },
  { to: '/flashcards', label: 'Flashcards',   Icon: Layers,          group: 'ESTUDIAR' },
  { to: '/simulacros', label: 'Simulacros',   Icon: Sparkles,        group: 'ESTUDIAR' },

  { to: '/planner',    label: 'Planificador', Icon: CalendarDays,    group: 'ORGANIZAR' },
  { to: '/stats',      label: 'Desempeño',    Icon: BarChart3,       group: 'ORGANIZAR' },
  { to: '/examenes',   label: 'Exámenes',     Icon: FileText,        group: 'ORGANIZAR' },
  { to: '/errores',    label: 'Mis errores',  Icon: AlertCircle,     group: 'ORGANIZAR' },
  { to: '/favoritos',  label: 'Favoritos',    Icon: Heart,           group: 'ORGANIZAR' },

  { to: '/comunidad',  label: 'Comunidad',    Icon: Users,           group: 'RED' },
];

function groupItems(items: NavItem[]) {
  const groups: Record<string, NavItem[]> = {};
  for (const it of items) {
    const g = it.group ?? 'OTROS';
    (groups[g] ||= []).push(it);
  }
  return groups;
}

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const grouped = groupItems(PRIMARY_NAV);

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'PP';

  const firstName = user?.nombre?.split(' ')[0] ?? 'Estudiante';
  const isPremium = user?.subscription?.status === 'active';

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <aside className={`${s.sidebar} ${mobileOpen ? s.sidebarMobileOpen : ''}`}>
      {/* Brand */}
      <div className={s.brandBlock}>
        <div
          className={s.brand}
          onClick={() => { navigate('/dashboard'); onClose(); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') { navigate('/dashboard'); onClose(); } }}
        >
          <div className={s.brandMark}>P</div>
          <div className={s.brandWord}>prep<em>rueba</em></div>
        </div>
      </div>

      {/* Nav */}
      <nav className={s.nav} aria-label="Navegación principal">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className={s.navGroup}>
            <div className={s.navGroupLabel}>{group}</div>
            <ul className={s.navList}>
              {items.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `${s.navItem} ${isActive ? s.navItemActive : ''}`
                    }
                    onClick={onClose}
                    end={to === '/dashboard'}
                  >
                    <span className={s.navItemIcon} aria-hidden="true">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className={s.navItemLabel}>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div
        className={s.userCard}
        onClick={() => { navigate('/settings'); onClose(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') { navigate('/settings'); onClose(); } }}
        aria-label="Ir a configuración"
      >
        <div className={s.userAvatar} aria-hidden="true">{initials}</div>
        <div className={s.userInfo}>
          <div className={s.userName}>{firstName}</div>
          <div className={`${s.userPlan} ${isPremium ? s.userPlanPremium : ''}`}>
            {isPremium ? '✦ Premium' : 'Plan gratuito'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={s.sidebarFooter}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${s.navItemFooter} ${isActive ? s.navItemActive : ''}`
          }
          onClick={onClose}
        >
          <span className={s.navItemIcon} aria-hidden="true">
            <Settings size={16} strokeWidth={1.8} />
          </span>
          <span>Configuración</span>
        </NavLink>

        <button
          className={s.navItemFooter}
          onClick={handleLogout}
          type="button"
          aria-label="Cerrar sesión"
        >
          <span className={s.navItemIcon} aria-hidden="true">
            <LogOut size={16} strokeWidth={1.8} />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
