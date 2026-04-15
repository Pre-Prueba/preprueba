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

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email.includes('@')) e.email = 'Introduce un email válido.';
    if (password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (!acceptedTerms) e.terms = 'Debes aceptar los términos para continuar.';
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(email, password, nombre || undefined);
      navigate('/onboarding');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Error al crear la cuenta.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Left panel ─────────────────────────────── */}
      <aside className={styles.panel} aria-hidden="true">
        <div className={styles.panelLogo}>
          <img src="/1.svg" width={36} height={36} alt="" />
          <span className={styles.panelLogoText}>prep<em>rueba</em></span>
        </div>

        <div className={styles.panelBody}>
          <h2 className={styles.panelHeadline}>
            Aprueba la prueba de acceso.<br />
            <em>Sin agobios.</em>
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
            "Llevaba dos años posponiendo el examen. Con Preprueba aprobé en la primera convocatoria."
          </p>
          <cite className={styles.panelQuoteName}>María José R., 41 años · Madrid</cite>
        </blockquote>
      </aside>

      {/* ── Form side ──────────────────────────────── */}
      <main className={styles.formSide}>
        <div className={styles.formWrap}>
          {/* Mobile logo */}
          <div className={styles.mobileLogoWrap}>
            <img src="/1.svg" width={48} height={48} alt="Preprueba" style={{ marginBottom: '8px' }} />
            <span className={styles.mobileLogoText}>prep<em>rueba</em></span>
          </div>

          <p className={styles.topLink}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>

          <h1 className={styles.formTitle}>Empieza hoy.</h1>
          <p className={styles.formSubtitle}>7 días gratis · Sin tarjeta hasta que quieras seguir.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="nombre">Nombre (opcional)</label>
                <input
                  id="nombre"
                  className={styles.input}
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Como quieres que te llamemos"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password
                  ? <span className={styles.fieldError}>{errors.password}</span>
                  : <span className={styles.fieldHint}>Mínimo 8 caracteres</span>
                }
              </div>

              <label className={styles.checkRow}>
                <span className={styles.checkboxWrap}>
                  <input
                    className={styles.checkboxInput}
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span className={styles.checkboxBox}>
                    <span className={styles.checkboxTick}>✓</span>
                  </span>
                </span>
                <span className={styles.checkLabel}>
                  Acepto los{' '}
                  <Link to="/terminos">términos de uso</Link>{' '}
                  y la{' '}
                  <Link to="/privacidad">política de privacidad</Link>
                </span>
              </label>
              {errors.terms && <span className={styles.fieldError}>{errors.terms}</span>}
            </div>

            {errors.general && (
              <div role="alert" className={styles.errorAlert}>{errors.general}</div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creando tu cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className={styles.bottomLink}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
