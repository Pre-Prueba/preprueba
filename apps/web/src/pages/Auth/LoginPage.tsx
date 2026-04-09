import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

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
      if (res.subscription?.status === 'ACTIVE') return navigate('/dashboard');
      navigate('/checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-persian-blue)', marginBottom: 'var(--space-8)' }}>Preprueba</p>
        <Card>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Iniciar sesión</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>{error}</p>}
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--color-persian-blue)', fontWeight: 600 }}>Regístrate</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
