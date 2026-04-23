import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, Settings, LogOut, AlertCircle, Heart, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import s from './Layout.module.css';

interface AppTopbarProps {
  onMobileMenu: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':   { title: 'Inicio',        subtitle: 'Tu panel de estudio' },
  '/practice':    { title: 'Practicar',     subtitle: 'Sesiones guiadas por materia' },
  '/flashcards':  { title: 'Flashcards',    subtitle: 'Revisión espaciada' },
  '/simulacros':  { title: 'Simulacros',    subtitle: 'Modo examen completo' },
  '/planner':     { title: 'Planificador',  subtitle: 'Tu plan de estudios' },
  '/stats':       { title: 'Desempeño',     subtitle: 'Métricas y progreso' },
  '/examenes':    { title: 'Exámenes',      subtitle: 'Biblioteca oficial' },
  '/comunidad':   { title: 'Comunidad',     subtitle: 'Foro y debates' },
  '/errores':     { title: 'Mis errores',   subtitle: 'Preguntas falladas' },
  '/favoritos':   { title: 'Favoritos',     subtitle: 'Preguntas guardadas' },
  '/settings':    { title: 'Configuración', subtitle: 'Cuenta y preferencias' },
  '/history':     { title: 'Historial',     subtitle: 'Sesiones anteriores' },
};

function resolvePage(path: string) {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  const base = '/' + (path.split('/')[1] ?? '');
  return PAGE_TITLES[base] ?? { title: '' };
}

export function AppTopbar({ onMobileMenu }: AppTopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const page = resolvePage(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const firstName = user?.nombre?.split(' ')[0] ?? '';
  const racha = (user as any)?.racha ?? 0;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className={s.topbar}>
      <div className={s.topbarLeft}>
        <button
          className={s.mobileMenuBtn}
          onClick={onMobileMenu}
          type="button"
          aria-label="Abrir menú"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <div className={s.topbarTitle}>
          <h1 className={s.pageTitle}>{page.title}</h1>
          {page.subtitle && <span className={s.pageSubtitle}>{page.subtitle}</span>}
        </div>
      </div>

      <div className={s.topbarRight}>
        {/* Search */}
        <div className={s.search} role="search">
          <Search size={14} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar..."
            className={s.searchInput}
            aria-label="Buscar materias, preguntas"
          />
          <span className={s.searchKbd} aria-hidden="true">⌘K</span>
        </div>

        {/* Streak */}
        {racha > 0 && (
          <div className={s.streakChip} aria-label={`${racha} días de racha`}>
            <span aria-hidden="true">🔥</span>
            <span>{racha}</span>
          </div>
        )}

        {/* Notifications */}
        <button className={s.iconBtn} type="button" aria-label="Notificaciones">
          <Bell size={17} strokeWidth={1.8} />
          <span className={s.iconBtnBadge} aria-hidden="true" />
        </button>

        {/* Profile dropdown */}
        <div className={s.dropdownWrap} ref={menuRef}>
          <button
            className={s.profileBtn}
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Menú de usuario"
          >
            <div className={s.profileAvatar} aria-hidden="true">{initials}</div>
            <span className={s.profileName}>{firstName}</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`${s.profileChevron} ${menuOpen ? s.profileChevronOpen : ''}`}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div className={s.dropdown} role="menu" aria-label="Opciones de usuario">
              <div className={s.dropdownHeader}>
                <div className={s.dropdownUserName}>{user?.nombre ?? 'Usuario'}</div>
                <div className={s.dropdownUserEmail}>{user?.email ?? ''}</div>
              </div>

              <div className={s.dropdownSection}>
                <NavLink
                  to="/settings"
                  className={s.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <User size={15} strokeWidth={1.8} aria-hidden="true" />
                  Mi perfil
                </NavLink>
                <NavLink
                  to="/errores"
                  className={s.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <AlertCircle size={15} strokeWidth={1.8} aria-hidden="true" />
                  Mis errores
                </NavLink>
                <NavLink
                  to="/favoritos"
                  className={s.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <Heart size={15} strokeWidth={1.8} aria-hidden="true" />
                  Favoritos
                </NavLink>
                <NavLink
                  to="/settings"
                  className={s.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <Settings size={15} strokeWidth={1.8} aria-hidden="true" />
                  Configuración
                </NavLink>
              </div>

              <div className={s.dropdownDivider} role="separator" />

              <div className={s.dropdownSection}>
                <button
                  className={`${s.dropdownItem} ${s.dropdownItemDanger}`}
                  onClick={handleLogout}
                  type="button"
                  role="menuitem"
                >
                  <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
