import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import styles from './Auth.module.css';

const FEATURES = [
  'Más de 4.200 preguntas de exámenes oficiales',
  'Corrección inmediata con feedback de IA',
  'Estadísticas de progreso por materia',
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.user.onboardingDone) return navigate('/onboarding');
      if (res.user.role === 'ADMIN') return navigate('/dashboard');
      if (res.subscription?.status === 'ACTIVE' || res.subscription?.status === 'TRIALING') {
        return navigate('/dashboard');
      }
      navigate('/checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Left panel ─────────────────────────────── */}
      <aside className={styles.panel} aria-hidden="true">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src="/1.svg" width={48} height={48} alt="Preprueba" style={{ borderRadius: '8px' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '20px', color: 'var(--pp-blue)' }}>
            prep<span style={{ color: 'var(--pp-orange)' }}>prueba</span>
          </span>
        </div>
        <div className={styles.panelBody}>
          <h2 className={styles.panelHeadline}>
            Bienvenido de vuelta.<br />
            <em>Sigue donde lo dejaste.</em>
          </h2>
          <ul className={styles.panelFeatures}>
            {FEATURES.map((f) => (
              <li key={f} className={styles.panelFeature}>
                <span className={styles.panelCheckIcon}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <blockquote className={styles.panelQuote}>
          <p className={styles.panelQuoteText}>
            "Lo que más me ayudó fue el feedback inmediato. Mi nota subió de 5,1 a 7,3 en 8 semanas."
          </p>
          <cite className={styles.panelQuoteName}>Carlos M., 28 años · Barcelona</cite>
        </blockquote>
      </aside>

      {/* ── Form side ──────────────────────────────── */}
      <main className={styles.formSide}>
        <div className={styles.formWrap}>
          {/* Mobile logo */}
          <div className={styles.panelLogo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/1.svg" width="40" height="40" alt="Preprueba" style={{ borderRadius: '8px' }} />
          <span className={styles.panelLogoText} style={{ color: '#063399' }}>prep<em style={{ color: 'var(--pp-orange)', fontStyle: 'normal' }}>prueba</em></span>
        </div>

          <p className={styles.topLink}>
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
          </p>

          <h1 className={styles.formTitle}>Bienvenido de vuelta.</h1>
          <p className={styles.formSubtitle}>Continúa donde lo dejaste.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className={styles.errorAlert}>{error}</div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className={styles.bottomLink}>
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
