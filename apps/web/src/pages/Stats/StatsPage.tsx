import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stats as statsApi } from '../../services/api';
import type { StatsResumen } from '../../types';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

const tendenciaIcon = { mejorando: '↑', estable: '→', bajando: '↓' };
const tendenciaColor = { mejorando: 'var(--color-success)', estable: 'var(--color-text-muted)', bajando: 'var(--color-error)' };

export function StatsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StatsResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.resumen().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <nav style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Inicio</Button>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Estadísticas</span>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-16)' }}><Spinner /></div>}

        {data && (
          <>
            {/* Resumen general */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {[
                { label: 'Sesiones', value: data.totalSesiones },
                { label: 'Respuestas', value: data.totalRespuestas },
                { label: 'Acierto global', value: `${data.porcentajeAcierto}%` },
                { label: 'Racha', value: `${data.racha} 🔥` },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-persian-blue)' }}>{s.value}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progreso por materia */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Por materia</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.porMateria.filter((m) => m.totalRespondidas > 0).map((m) => (
                <div key={m.materiaId} style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.materiaNombre}</span>
                    <span style={{ color: tendenciaColor[m.tendencia], fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {tendenciaIcon[m.tendencia]} {m.porcentajeAcierto}%
                    </span>
                  </div>
                  <ProgressBar value={m.porcentajeAcierto} />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>{m.totalRespondidas} preguntas respondidas</p>
                </div>
              ))}
              {data.porMateria.every((m) => m.totalRespondidas === 0) && (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>Todavía no has practicado ninguna materia.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
