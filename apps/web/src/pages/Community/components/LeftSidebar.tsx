import { NavLink } from 'react-router-dom';
import { Home, MessageCircleQuestion, BookOpen, GraduationCap, Bookmark, User, Flame, BookText } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import s from './LeftSidebar.module.css';

export function LeftSidebar() {
  const { popularMaterias } = useSelector((state: RootState) => state.community);

  const mainNav = [
    { label: 'Inicio', icon: Home, path: '/comunidad' },
    { label: 'Preguntas', icon: MessageCircleQuestion, path: '/comunidad/preguntas' },
    { label: 'Materias', icon: BookOpen, path: '/comunidad/materias' },
    { label: 'Universidades', icon: GraduationCap, path: '/comunidad/universidades' },
  ];

  const personalNav = [
    { label: 'Guardados', icon: Bookmark, path: '/comunidad/guardados' },
    { label: 'Mis publicaciones', icon: User, path: '/comunidad/mis-publicaciones' },
  ];

  const exploreNav = [
    { label: 'Tendencias', icon: Flame, path: '/comunidad/tendencias' },
    { label: 'Reglas', icon: BookText, path: '/comunidad/reglas' },
  ];

  const createNavLinks = (items: typeof mainNav) => (
    items.map(item => (
      <NavLink
        key={item.path}
        to={item.path}
        end
        className={({ isActive }) => `${s.navLink} ${isActive ? s.active : ''}`}
      >
        <item.icon className={s.icon} size={18} />
        {item.label}
      </NavLink>
    ))
  );

  return (
    <div className={s.container}>
      <nav className={s.navGroup}>
        {createNavLinks(mainNav)}
      </nav>

      <nav className={s.navGroup}>
        <div className={s.navTitle}>Tú</div>
        {createNavLinks(personalNav)}
      </nav>

      <nav className={s.navGroup}>
        <div className={s.navTitle}>Explorar</div>
        {createNavLinks(exploreNav)}
      </nav>

      {popularMaterias && popularMaterias.length > 0 && (
        <div className={s.navGroup}>
          <div className={s.navTitle}>Top Materias</div>
          <div className={s.tagList}>
            {popularMaterias.map(m => (
              <NavLink 
                key={m.id} 
                to={`/comunidad/materias/${m.id}`}
                className={({ isActive }) => `${s.tag} ${isActive ? s.active : ''}`}
              >
                {m.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
