import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { staggerContainer, fadeUp } from '../../lib/animations';

/* ── Logo mark inline */
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
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px', fontWeight: 600,
            color: 'var(--text)', marginBottom: '6px',
          }}>
            Bienvenido de vuelta.
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', marginBottom: '28px' }}>
            Continúa donde lo dejaste.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <div role="alert" style={{
                background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                fontSize: '13px', color: 'var(--error)',
              }}>
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-3)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 500 }}>Regístrate gratis</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
