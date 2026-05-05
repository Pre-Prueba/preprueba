import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { stripe as stripeApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

const SELECTED_PRICE_KEY = 'preprueba_selected_price_id';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');
    try {
      const selectedPriceId = searchParams.get('priceId') ?? localStorage.getItem(SELECTED_PRICE_KEY) ?? undefined;
      const { checkoutUrl } = await stripeApi.checkout(selectedPriceId);
      window.location.href = checkoutUrl ?? '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-persian-blue)', marginBottom: 'var(--space-8)' }}>Preprueba</p>
        <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Empieza a practicar hoy</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Plan Preprueba</p>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-carrot)', marginBottom: 'var(--space-6)' }}>
            €9,99<span style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-muted)' }}> / mes</span>
          </div>
          <ul style={{ listStyle: 'none', marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {['Todas las materias', 'Corrección con IA', 'Historial de progreso', 'Sin permanencia'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</p>}
          <Button fullWidth size="lg" disabled={loading} onClick={handleCheckout}>
            {loading ? 'Redirigiendo...' : 'Pagar con tarjeta →'}
          </Button>
          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            🔒 Pago seguro con Stripe
          </p>
        </div>
        <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            Volver al inicio
          </button>
        </p>
      </div>
    </div>
  );
}
