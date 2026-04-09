import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { stripe as stripeApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <nav style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Inicio</Button>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Ajustes</span>
      </nav>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{error}</p>}

        {/* Cuenta */}
        <Card>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Cuenta</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
              <span style={{ fontWeight: 500 }}>{user?.email}</span>
            </div>
            {user?.nombre && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Nombre</span>
                <span style={{ fontWeight: 500 }}>{user.nombre}</span>
              </div>
            )}
            {user?.pruebaType && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Prueba</span>
                <span style={{ fontWeight: 500 }}>{user.pruebaType.replace('_', ' ').toLowerCase()}</span>
              </div>
            )}
            {user?.comunidad && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Comunidad</span>
                <span style={{ fontWeight: 500 }}>{user.comunidad}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Suscripción */}
        <Card>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Suscripción</h2>
          {subscription?.status === 'ACTIVE' ? (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                <span style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Activa</span>
                {periodEnd && <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-3)' }}>Plan activo · €9,99/mes · Próximo cobro {periodEnd}</span>}
              </p>
              <Button variant="secondary" onClick={handlePortal} disabled={portalLoading}>
                {portalLoading ? 'Cargando...' : 'Gestionar suscripción'}
              </Button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>No tienes un plan activo.</p>
              <Button onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? 'Cargando...' : 'Suscribirse — €9,99/mes'}
              </Button>
            </div>
          )}
        </Card>

        {/* Cerrar sesión */}
        <Card>
          <Button variant="secondary" onClick={() => { logout(); navigate('/login'); }} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
            Cerrar sesión
          </Button>
        </Card>
      </main>
    </div>
  );
}
