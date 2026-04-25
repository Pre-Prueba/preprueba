import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, Search, Bell, Settings, LogOut, BarChart2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, subscription, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'UD';

  const isPremium = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <header className={s.topbar}>
      {/* Left — page title */}
      <div className={s.topbarLeft}>
        <button className={s.mobileMenuBtn} onClick={onMenuClick} aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <div className={s.topbarTitle}>
          <span className={s.pageTitle}>Inicio</span>
          <span className={s.pageSubtitle}>Tu panel de estudio</span>
        </div>
      </div>

      {/* Right */}
      <div className={s.topbarRight}>
        {/* Search */}
        <div className={s.search}>
          <Search size={14} />
          <input className={s.searchInput} placeholder="Buscar..." aria-label="Buscar" />
          <span className={s.searchKbd}>⌘K</span>
        </div>

        {/* Notifications */}
        <button className={s.iconBtn} aria-label="Notificaciones">
          <Bell size={18} />
          <span className={s.iconBtnBadge} />
        </button>

        {/* Profile dropdown — avatar only, like reference */}
        <div className={s.dropdownWrap}>
          <button
            className={s.profileBtn}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-label="Menú de perfil"
          >
            <div className={s.profileAvatar}>{initials}</div>
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div className={s.dropdown} style={{ zIndex: 100 }}>
                <div className={s.dropdownHeader}>
                  <div className={s.dropdownUserName}>{user?.nombre ?? 'Usuario'}</div>
                  <div className={s.dropdownUserEmail}>{user?.email ?? ''}</div>
                  {isPremium && (
                    <div style={{ marginTop: 4, fontSize: 11, color: 'var(--pp-amber)', fontWeight: 600 }}>
                      ★ Premium
                    </div>
                  )}
                </div>

                <div className={s.dropdownSection}>
                  <NavLink to="/settings" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <Settings size={14} /> Configuración
                  </NavLink>
                  <NavLink to="/stats" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <BarChart2 size={14} /> Desempeño
                  </NavLink>
                  <NavLink to="/errores" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <AlertCircle size={14} /> Mis errores
                  </NavLink>
                </div>

                <div className={s.dropdownDivider} />

                <div className={s.dropdownSection}>
                  <button className={[s.dropdownItem, s.dropdownItemDanger].join(' ')} onClick={handleLogout}>
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
