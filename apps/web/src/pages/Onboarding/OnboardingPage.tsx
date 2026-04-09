import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { auth as authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

const PRUEBA_OPTIONS = [
  { value: 'MAYORES_25', label: 'Mayores de 25 años' },
  { value: 'MAYORES_40', label: 'Mayores de 40 años' },
  { value: 'MAYORES_45', label: 'Mayores de 45 años' },
];

const CCAA = [
  'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
  'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia',
  'La Rioja', 'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'Valencia', 'Ceuta', 'Melilla',
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const [step, setStep] = useState(1);
  const [pruebaType, setPruebaType] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFinish() {
    if (!pruebaType || !comunidad) return;
    setLoading(true);
    try {
      await authApi.onboarding(pruebaType, comunidad);
      await fetchMe();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tus preferencias.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-persian-blue)', marginBottom: 'var(--space-8)' }}>Preprueba</p>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 'var(--radius-full)', background: n <= step ? 'var(--color-persian-blue)' : 'var(--color-platinum)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Step 1 — Tipo de prueba */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>¿Para qué prueba te preparas?</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Esto nos ayuda a mostrarte las materias correctas.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {PRUEBA_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPruebaType(opt.value)}
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${pruebaType === opt.value ? 'var(--color-carrot)' : 'var(--color-border)'}`,
                    background: pruebaType === opt.value ? 'var(--color-badge-general-bg)' : 'var(--color-white)',
                    color: 'var(--color-text)',
                    fontWeight: pruebaType === opt.value ? 600 : 400,
                    fontSize: 'var(--text-base)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button fullWidth disabled={!pruebaType} onClick={() => setStep(2)}>Continuar →</Button>
          </div>
        )}

        {/* Step 2 — Comunidad */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>¿En qué comunidad autónoma?</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Filtramos las preguntas según los exámenes de tu comunidad.</p>
            <select
              value={comunidad}
              onChange={(e) => setComunidad(e.target.value)}
              style={{
                width: '100%', padding: 'var(--space-3) var(--space-4)',
                borderRadius: '10px', border: '1.5px solid var(--color-border)',
                fontSize: 'var(--text-base)', color: comunidad ? 'var(--color-text)' : 'var(--color-text-muted)',
                background: 'var(--color-white)', marginBottom: 'var(--space-6)',
              }}
            >
              <option value="">Selecciona tu comunidad</option>
              {CCAA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" onClick={() => setStep(1)}>← Atrás</Button>
              <Button fullWidth disabled={!comunidad} onClick={() => setStep(3)}>Continuar →</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Bienvenida */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🎉</div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              ¡Todo listo{user?.nombre ? `, ${user.nombre}` : ''}!
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
              Ahora empieza tu período de prueba de 7 días gratis. Practica cuando quieras, sin compromisos.
            </p>
            {error && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>{error}</p>}
            <Button size="lg" onClick={handleFinish} disabled={loading}>
              {loading ? 'Guardando...' : 'Ir a practicar →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
