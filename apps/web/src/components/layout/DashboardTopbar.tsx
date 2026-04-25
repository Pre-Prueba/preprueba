import { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, Bell, Settings, LogOut, BarChart2, AlertCircle, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchModal } from './SearchModal';
import s from './Layout.module.css';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, subscription, logout } = useAuthStore();
  const navigate = useNavigate();

  const { notifications, unreadCount, isLoading: loadingNotifs } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'UD';

  const isPremium = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  }

  // Close notif dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleNotifClick(n: typeof notifications[0]) {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
    setNotifOpen(false);
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
        <SearchModal />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className={s.iconBtn}
            aria-label="Notificaciones"
            onClick={() => setNotifOpen((v) => !v)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className={s.iconBtnBadge} style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--pp-red)', display: 'block' }} />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={s.dropdown}
                style={{ zIndex: 100, right: 0, top: 'calc(100% + 8px)', width: 320, maxHeight: 400, overflow: 'auto' }}
              >
                <div className={s.dropdownHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notificaciones</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <CheckCheck size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Marcar todo
                    </button>
                  )}
                </div>

                {loadingNotifs && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Cargando...</div>
                )}

                {!loadingNotifs && notifications.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    Sin notificaciones
                  </div>
                )}

                {!loadingNotifs && notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : 'rgba(53,92,245,0.04)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text-1)', lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.3 }}>{n.message}</div>
                    </div>
                    {!n.read && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
