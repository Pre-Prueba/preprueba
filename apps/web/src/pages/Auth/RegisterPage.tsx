import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email.includes('@')) e.email = 'Introduce un email válido.';
    if (password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.';
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-persian-blue)', marginBottom: 'var(--space-8)' }}>Preprueba</p>
        <Card>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Crear cuenta</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label="Nombre (opcional)" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required autoComplete="email" />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required autoComplete="new-password" />
            {errors.general && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>{errors.general}</p>}
            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-persian-blue)', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
