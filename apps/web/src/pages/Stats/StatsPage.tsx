import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { stats as statsApi } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import type { StatsResumen } from '../../types';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { fadeUp, staggerContainer, listItem } from '../../lib/animations';

function isSubscriptionRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === 'SUBSCRIPTION_REQUIRED';
}

function TendenciaIcon({ tendencia }: { tendencia: 'mejorando' | 'estable' | 'bajando' }) {
  if (tendencia === 'mejorando') return <TrendingUp size={14} style={{ color: 'var(--success)' }} />;
  if (tendencia === 'bajando') return <TrendingDown size={14} style={{ color: 'var(--error)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-3)' }} />;
}

export function StatsPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuthStore();
  const [data, setData] = useState<StatsResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  useEffect(() => {
    let active = true;

    if (!hasSubscription) {
      setData(null);
      setError('');
      setSubscriptionLocked(true);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    setData(null);
    setSubscriptionLocked(false);

    statsApi.resumen()
      .then((stats) => {
        if (!active) return;
        setSubscriptionLocked(false);
        setData(stats);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (isSubscriptionRequiredError(err)) {
          setSubscriptionLocked(true);
          return;
        }
        setSubscriptionLocked(false);
        setError('No hemos podido cargar tus estadísticas.');
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [hasSubscription]);

  const materiasConActividad = data?.porMateria.filter((m) => m.totalRespondidas > 0) ?? [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Navbar */}
      <nav style={{
        background: 'rgba(247,249,252,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '14px', fontFamily: 'var(--font-ui)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s' }}
          type="button"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ArrowLeft size={16} /> Inicio
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', color: 'var(--text)' }}>
          Estadísticas
        </span>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-16)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Subscription locked */}
        {!loading && subscriptionLocked && (
          <EmptyState
            title="Activa tu plan para ver tus estadísticas"
            description="Las estadísticas se generan a partir de tus sesiones reales de práctica."
            actionLabel="Suscribirme"
            onAction={() => navigate('/checkout')}
          />
        )}

        {/* Error */}
        {!loading && !subscriptionLocked && error && (
          <div style={{ background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--error)', padding: 'var(--space-5)', textAlign: 'center', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* No sessions yet */}
        {!loading && !subscriptionLocked && data && data.totalSesiones === 0 && (
          <EmptyState
            title="Aún no tienes estadísticas"
            description="Completa tu primera práctica para ver tu progreso real por materia."
            actionLabel="Ir al dashboard"
            onAction={() => navigate('/dashboard')}
          />
        )}

        {/* Data */}
        {!loading && !subscriptionLocked && data && data.totalSesiones > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show">

            {/* Metrics strip */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}
            >
              {[
                { label: 'Sesiones', value: data.totalSesiones },
                { label: 'Respuestas', value: data.totalRespuestas },
                { label: 'Acierto global', value: `${data.porcentajeAcierto}%` },
                { label: 'Racha actual', value: `${data.racha} 🔥` },
              ].map((metric) => (
                <motion.div
                  key={metric.label}
                  variants={listItem}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--blue)', lineHeight: 1, marginBottom: '6px' }}>
                    {metric.value}
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    {metric.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Per-subject */}
            <motion.p
              variants={fadeUp}
              style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 'var(--space-4)' }}
            >
              Por materia
            </motion.p>

            <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {materiasConActividad.length === 0 ? (
                <motion.p variants={fadeUp} style={{ color: 'var(--text-3)', textAlign: 'center', padding: 'var(--space-8)', fontSize: '14px' }}>
                  Todavía no has practicado ninguna materia.
                </motion.p>
              ) : (
                materiasConActividad.map((m) => (
                  <motion.div
                    key={m.materiaId}
                    variants={listItem}
                    style={{
                      background: 'var(--white)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-5)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{m.materiaNombre}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TendenciaIcon tendencia={m.tendencia} />
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          fontSize: '15px',
                          color: m.tendencia === 'mejorando' ? 'var(--success)' : m.tendencia === 'bajando' ? 'var(--error)' : 'var(--text-2)',
                        }}>
                          {m.porcentajeAcierto}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={m.porcentajeAcierto} />
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 'var(--space-2)' }}>
                      {m.totalRespondidas} preguntas respondidas
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>

          </motion.div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-12) var(--space-8)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--space-3)' }}>
        {title}
      </p>
      <p style={{ color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontSize: '14px' }}>
        {description}
      </p>
      <Button variant="orange" onClick={onAction}>{actionLabel}</Button>
    </motion.div>
  );
}
