import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { staggerContainer, fadeUp } from '../../lib/animations';

function LogoMark() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
      <div style={{ color: 'var(--blue)', marginBottom: '12px' }}>
        <svg width="48" height="34" viewBox="0 0 44 32" fill="none">
          <rect x="0" y="5" width="20" height="20" rx="5" fill="currentColor" opacity="0.12" />
          <path d="M4 9Q10 7 10 17Q10 7 16 9L16 25Q10 23 10 17Q10 23 4 25Z" fill="currentColor" />
          <circle cx="18" cy="5" r="5" fill="var(--orange)" />
          <path d="M16 5L18 2L20 5" fill="white" />
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', color: 'var(--text)' }}>
        prep<span style={{ color: 'var(--blue)' }}>prueba</span>
      </span>
    </div>
  );
}

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, var(--blue-soft) 0%, var(--bg) 70%)',
    }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <motion.div variants={fadeUp}>
          <LogoMark />
        </motion.div>

        <motion.div variants={fadeUp} style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          padding: '36px 32px',
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Empieza hoy.
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '28px' }}>
            7 días gratis · Sin tarjeta hasta que quieras seguir.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre (opcional)"
              name="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="given-name"
              placeholder="Como quieres que te llamemos"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="new-password"
              hint="Mínimo 8 caracteres"
            />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '3px', accentColor: 'var(--blue)', width: '16px', height: '16px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                Acepto los{' '}
                <Link to="/terminos" style={{ color: 'var(--blue)', fontWeight: 500 }}>términos de uso</Link>{' '}
                y la{' '}
                <Link to="/privacidad" style={{ color: 'var(--blue)', fontWeight: 500 }}>política de privacidad</Link>
              </span>
            </label>

            {errors.terms && (
              <span style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.terms}</span>
            )}
            {errors.general && (
              <div role="alert" style={{ background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--error)' }}>
                {errors.general}
              </div>
            )}

            <Button type="submit" variant="orange" fullWidth disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Creando tu cuenta...' : 'Crear cuenta gratis'}
            </Button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500 }}>Inicia sesión</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
