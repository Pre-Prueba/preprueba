import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, CreditCard, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { stripe as stripeApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { fadeUp, staggerContainer } from '../../lib/animations';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-5) var(--space-6)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ color: 'var(--blue)', opacity: 0.7 }}>{icon}</div>
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{title}</span>
      </div>
      <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
        {children}
      </div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, subscription, logout } = useAuthStore();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const { portalUrl } = await stripeApi.portal();
      window.location.href = portalUrl ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al acceder al portal.');
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const { checkoutUrl } = await stripeApi.checkout();
      window.location.href = checkoutUrl ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el pago.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')
    : null;

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Navbar */}
      <nav style={{
        background: 'rgba(247,249,252,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '14px', fontFamily: 'var(--font-ui)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s' }}
          type="button"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ArrowLeft size={16} /> Inicio
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', color: 'var(--text)' }}>
          Ajustes
        </span>
      </nav>

      <main style={{ maxWidth: '560px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {error && (
            <motion.div variants={fadeUp} style={{ background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--error)' }}>
              {error}
            </motion.div>
          )}

          {/* ── Cuenta */}
          <Section icon={<User size={16} />} title="Cuenta">
            <div style={{ marginTop: '-var(--space-2)' }}>
              {user?.email && <Row label="Email" value={user.email} />}
              {user?.nombre && <Row label="Nombre" value={user.nombre} />}
              {user?.pruebaType && (
                <Row label="Prueba" value={user.pruebaType.replace('_', ' ').toLowerCase()} />
              )}
              {user?.comunidad && <Row label="Comunidad" value={user.comunidad} />}
            </div>
          </Section>

          {/* ── Suscripción */}
          <Section icon={<CreditCard size={16} />} title="Suscripción">
            {isActive ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <span style={{
                    background: 'var(--success-bg)', color: 'var(--success)',
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Activa
                  </span>
                  {periodEnd && (
                    <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                      €9,99/mes · próximo cobro {periodEnd}
                    </span>
                  )}
                </div>
                <Button variant="secondary" onClick={handlePortal} disabled={portalLoading}>
                  {portalLoading ? 'Cargando...' : 'Gestionar suscripción'}
                </Button>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 'var(--space-3)', lineHeight: 1.5 }}>
                  Si cancelas, pierdes el acceso pero guardamos todo tu progreso. Puedes volver cuando quieras.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  Sin plan activo. Activa tu acceso para practicar con todas las materias y la corrección por IA.
                </p>
                <Button variant="orange" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? 'Cargando...' : 'Activar acceso — €9,99/mes'}
                </Button>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 'var(--space-3)' }}>
                  7 días gratis · Sin permanencia · Cancela cuando quieras
                </p>
              </div>
            )}
          </Section>

          {/* ── Cerrar sesión */}
          <Section icon={<LogOut size={16} />} title="Sesión">
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Al cerrar sesión, tu progreso queda guardado. Puedes volver cuando quieras.
            </p>
            <Button
              variant="ghost"
              onClick={() => { logout(); navigate('/'); }}
              style={{ color: 'var(--error)', borderColor: 'rgba(214,69,69,0.3)' }}
            >
              Cerrar sesión
            </Button>
          </Section>

        </motion.div>
      </main>
    </div>
  );
}
