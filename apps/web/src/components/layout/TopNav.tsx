import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconPracticar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="12" x="2" y="10" rx="2"/><circle cx="12" cy="16" r="2"/>
  </svg>
);

const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconPen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L21 6z" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.91 20.16 25.27 12 19.63 3.84 25.27 6.82 16.91 0 10.27 8.91 10.26 12 2" />
  </svg>
);

const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconDesempeno = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const IconPlanner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
  </svg>
);

const IconForo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: IconHome },
    { path: '/practice', label: 'Practicar', icon: IconPracticar },
    { path: '/stats', label: 'Desempeño', icon: IconDesempeno },
    { path: '/planner', label: 'Planner', icon: IconPlanner },
    { path: '/comunidad', label: 'Comunidad', icon: IconForo },
  ];

  return (
    <>
      <nav className={s.topNav}>
        <div className={s.topNavContent}>
          {/* Logo Left */}
          <div className={s.navLogo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/1.svg" width="40" height="40" alt="Preprueba" style={{ borderRadius: '8px' }} />
            <span className={s.logoText}>prep<em>rueba</em></span>
          </div>

          {/* Center Nav Links */}
          <div className={s.navLinksCenter}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={`${path}-${label}`}
                to={path}
                className={({ isActive }) => `${s.navLink} ${isActive ? s.navLinkActive : ''}`}
                title={label}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className={s.navRight}>
            {/* Avatar with Dropdown */}
            <div className={s.profileContainer}>
              <button
                className={s.avatarButton}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                type="button"
                title={user?.nombre}
              >
                <div className={s.navAvatar}>
                  {initials}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className={s.profileDropdown}>
                  <div className={s.profileHeader}>
                    <p className={s.profileName}>Hola, {user?.nombre ?? 'Usuario'}</p>
                    <p className={s.profileEmail}>{user?.email ?? 'email@example.com'}</p>
                  </div>

                  <div className={s.profileDivider} />

                  <NavLink
                    to="/errores"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <span>Cuaderno de Errores</span>
                  </NavLink>

                  <NavLink
                    to="/flashcards"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <span>Flashcards</span>
                  </NavLink>

                  <NavLink
                    to="/favoritos"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>Favoritos</span>
                  </NavLink>

                  <NavLink
                    to="/history"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Historial</span>
                  </NavLink>

                  <NavLink
                    to="/planner"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Mi Plan</span>
                  </NavLink>

                  <NavLink
                    to="/comunidad"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Comunidad</span>
                  </NavLink>

                  <div className={s.profileDivider} />

                  <NavLink
                    to="/settings"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>Configuración</span>
                  </NavLink>

                  <NavLink
                    to="/checkout"
                    className={s.profileMenuItem}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    <span>Suscripción</span>
                  </NavLink>

                  <div className={s.profileDivider} />

                  <button
                    className={s.profileMenuItem}
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={16} />
                    <span>Salir</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className={s.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={s.mobileMenuOverlay}>
          <div className={s.mobileMenuContent}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={`${path}-${label}`}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `${s.mobileNavLink} ${isActive ? s.mobileNavLinkActive : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className={s.mobileMenuDivider} />

            <button
              className={s.mobileNavLink}
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              type="button"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
