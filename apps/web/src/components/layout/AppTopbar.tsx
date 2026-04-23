import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, BookOpen, Layers, Flame, Settings, LogOut } from 'lucide-react';
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
  '/settings':    { title: 'Configuración' },
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

  return (
    <header className={s.topbar}>
      <div className={s.topbarLeft}>
        <button
          className={s.mobileMenuBtn}
          onClick={onMobileMenu}
          type="button"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div className={s.topbarTitle}>
          <h1 className={s.pageTitle}>{page.title}</h1>
          {page.subtitle && <span className={s.pageSubtitle}>{page.subtitle}</span>}
        </div>
      </div>

      <div className={s.topbarRight}>
        <div className={s.search}>
          <Search size={16} strokeWidth={1.8} />
          <input
            type="search"
            placeholder="Buscar materias, preguntas..."
            className={s.searchInput}
          />
          <span className={s.searchKbd}>⌘K</span>
        </div>

        <button className={s.iconBtn} type="button" aria-label="Notificaciones">
          <Bell size={18} strokeWidth={1.8} />
          <span className={s.iconBtnBadge} />
        </button>

        <div className={s.streakChip} title="Racha actual">
          <Flame size={14} strokeWidth={2} />
          <span>5</span>
        </div>

        <div className={s.profileWrap} ref={menuRef}>
          <button
            className={s.profileBtn}
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
            aria-expanded={menuOpen}
          >
            <div className={s.profileAvatar}>{initials}</div>
            <ChevronDown size={14} strokeWidth={2} className={`${s.profileChevron} ${menuOpen ? s.profileChevronOpen : ''}`} />
          </button>

          {menuOpen && (
            <div className={s.profileMenu} role="menu">
              <div className={s.profileHead}>
                <div className={s.profileAvatarLg}>{initials}</div>
                <div>
                  <div className={s.profileName}>{user?.nombre ?? 'Usuario'}</div>
                  <div className={s.profileEmail}>{user?.email ?? ''}</div>
                </div>
              </div>
              <div className={s.profileDivider} />
              <NavLink to="/errores" className={s.menuItem} onClick={() => setMenuOpen(false)}>
                <BookOpen size={16} strokeWidth={1.8} /><span>Cuaderno de errores</span>
              </NavLink>
              <NavLink to="/flashcards" className={s.menuItem} onClick={() => setMenuOpen(false)}>
                <Layers size={16} strokeWidth={1.8} /><span>Flashcards</span>
              </NavLink>
              <NavLink to="/settings" className={s.menuItem} onClick={() => setMenuOpen(false)}>
                <Settings size={16} strokeWidth={1.8} /><span>Configuración</span>
              </NavLink>
              <div className={s.profileDivider} />
              <button
                className={`${s.menuItem} ${s.menuItemDanger}`}
                onClick={() => { logout(); navigate('/login'); }}
                type="button"
              >
                <LogOut size={16} strokeWidth={1.8} /><span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
