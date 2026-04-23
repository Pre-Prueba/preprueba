import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CalendarDays, BarChart3,
  FileText, Sparkles, Users, Layers, Settings, LogOut, ChevronRight
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
  { to: '/dashboard',  label: 'Inicio',      Icon: LayoutDashboard, group: 'ESTUDIAR' },
  { to: '/practice',   label: 'Practicar',   Icon: BookOpen,        group: 'ESTUDIAR' },
  { to: '/flashcards', label: 'Flashcards',  Icon: Layers,          group: 'ESTUDIAR' },
  { to: '/simulacros', label: 'Simulacros',  Icon: Sparkles,        group: 'ESTUDIAR' },

  { to: '/planner',    label: 'Planificador', Icon: CalendarDays,   group: 'ORGANIZAR' },
  { to: '/stats',      label: 'Desempeño',    Icon: BarChart3,      group: 'ORGANIZAR' },
  { to: '/examenes',   label: 'Exámenes',     Icon: FileText,       group: 'ORGANIZAR' },

  { to: '/comunidad',  label: 'Comunidad',    Icon: Users,          group: 'RED' },
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
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/dashboard'); }}
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
                  >
                    <span className={s.navItemIcon} aria-hidden>
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <span className={s.navItemLabel}>{label}</span>
                    <ChevronRight size={14} className={s.navItemChevron} aria-hidden />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={s.sidebarFooter}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${s.navItem} ${s.navItemDense} ${isActive ? s.navItemActive : ''}`
          }
          onClick={onClose}
        >
          <span className={s.navItemIcon} aria-hidden><Settings size={18} strokeWidth={1.8} /></span>
          <span className={s.navItemLabel}>Configuración</span>
        </NavLink>

        <button
          className={`${s.navItem} ${s.navItemDense} ${s.navItemButton}`}
          onClick={handleLogout}
          type="button"
        >
          <span className={s.navItemIcon} aria-hidden><LogOut size={18} strokeWidth={1.8} /></span>
          <span className={s.navItemLabel}>Salir</span>
        </button>

        <div
          className={s.userCard}
          onClick={() => navigate('/settings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/settings'); }}
        >
          <div className={s.userAvatar}>{initials}</div>
          <div className={s.userInfo}>
            <div className={s.userName}>{user?.nombre ?? 'Usuario'}</div>
            <div className={s.userPlan}>Plan gratuito</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
