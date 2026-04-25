import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Sparkles, Clock, Target, History } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useStats, useStudyTips } from '../../hooks/useStats';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import s from './Stats.module.css';

function TendenciaIcon({ tendencia }: { tendencia: 'mejorando' | 'estable' | 'bajando' }) {
  if (tendencia === 'mejorando') return <TrendingUp size={14} />;
  if (tendencia === 'bajando')   return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function StudyTips() {
  const { data: tips = [], isLoading } = useStudyTips();
  if (isLoading || tips.length === 0) return null;

  return (
    <div className={s.tipsBlock}>
      <div className={s.tipsHeader}>
        <Sparkles size={18} color="var(--blue)" fill="rgba(10, 91, 255, 0.1)" />
        <h3 className={s.tipsTitle}>Recomendaciones de tu Mentor IA</h3>
      </div>
      <ul className={s.tipsList}>
        {tips.map((tip, i) => (
          <li key={i} className={s.tipsItem}>
            <span className={s.tipsBullet}>•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatsPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuthStore();
  const { data, isLoading: loading } = useStats();

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');
  const subscriptionLocked = !hasSubscription;

  const materiasConActividad = data?.porMateria.filter((m) => m.totalRespondidas > 0) ?? [];
  
  const sorted = [...materiasConActividad].sort((a,b) => b.porcentajeAcierto - a.porcentajeAcierto);
  const fortes = sorted.filter(m => m.porcentajeAcierto >= 60);
  const fracas = sorted.filter(m => m.porcentajeAcierto < 60);

  const temporalData = data?.weeklyEvolution ?? [];

  return (
    <div className={s.statsPage}>

      <header className={s.header}>
        <div>
          <h1 className={s.title}>Mis Estadísticas</h1>
          <p className={s.subtitle}>Analiza tu rendimiento real y prepárate para el éxito.</p>
        </div>
        <button className={s.historyBtn} onClick={() => navigate('/history')}>
          <History size={16} /> Ver historial
        </button>
      </header>

      {loading && !data && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 0.9s linear infinite' }} />
        </div>
      )}

      {!loading && subscriptionLocked && (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <Target size={40} />
          </div>
          <p className={s.emptyTitle}>Estadísticas Avanzadas</p>
          <p className={s.emptyDesc}>Desbloquea análisis detallados por materia y evolución temporal activando tu suscripción Premium.</p>
          <button className={s.emptyBtn} onClick={() => navigate('/checkout')}>Ver planes</button>
        </div>
      )}

      {!loading && !subscriptionLocked && data && data.totalRespuestas === 0 && (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <Sparkles size={40} />
          </div>
          <p className={s.emptyTitle}>Tu viaje comienza aquí</p>
          <p className={s.emptyDesc}>Completa tu primera sesión para generar análisis detallados sobre tus fortalezas y debilidades.</p>
          <button className={s.emptyBtn} onClick={() => navigate('/practice')}>Empezar a practicar</button>
        </div>
      )}

      {!loading && !subscriptionLocked && data && data.totalRespuestas > 0 && (
        <>
          <div className={s.metricsGrid}>
            <div className={`${s.metricCard} ${s.rachaCard}`}>
              <p className={s.metricValue}>{data.racha}🔥</p>
              <p className={s.metricLabel}>Días en racha</p>
            </div>
            <div className={s.metricCard}>
              <p className={s.metricValue}>{data.totalSesiones}</p>
              <p className={s.metricLabel}>Sesiones completadas</p>
            </div>
            <div className={s.metricCard}>
              <p className={s.metricValue}>{data.totalRespuestas}</p>
              <p className={s.metricLabel}>Total respuestas</p>
            </div>
            <div className={s.metricCard}>
              <p className={s.metricValue}>{data.porcentajeAcierto}%</p>
              <p className={s.metricLabel}>Acierto global</p>
            </div>
          </div>

          <div className={s.chartSection}>
            <h2 className={s.sectionLabel}>Evolución Semanal</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-3)', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-3)', fontSize: 12, fontWeight: 500}} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: 'var(--blue-soft)', opacity: 0.5}}
                    contentStyle={{borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', boxShadow: 'var(--shadow-lg)'}}
                  />
                  <Bar dataKey="acierto" fill="var(--blue)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <StudyTips />

          <div className={s.splitGrid}>
            <div>
              <h3 className={s.columnTitle}><Target size={20} color="#22c55e" /> Materias Fuertes</h3>
              <div className={s.subjectList}>
                {fortes.length === 0 ? <p style={{color: 'var(--text-3)', fontSize: 14, padding: '20px', textAlign: 'center'}}>No hay datos de maestría todavía.</p> : null}
                {fortes.map((m) => (
                  <div key={m.materiaId} className={s.subjectCard}>
                    <div className={s.subjectRow}>
                      <span className={s.subjectName}>{m.materiaNombre}</span>
                      <div className={`${s.subjectScore} ${m.tendencia === 'mejorando' ? s.scoreMejorando : m.tendencia === 'bajando' ? s.scoreBajando : s.scoreEstable}`}>
                        <TendenciaIcon tendencia={m.tendencia} /> {m.porcentajeAcierto}%
                      </div>
                    </div>
                    <div className={s.progressTrack}>
                      <div className={s.progressFill} style={{ width: `${m.porcentajeAcierto}%`, background: '#22c55e' }} />
                    </div>
                    <p className={s.subjectMeta}>{m.totalRespondidas} preguntas estudiadas</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={s.columnTitle}><Clock size={20} color="#ef4444" /> Áreas de Mejora</h3>
              <div className={s.subjectList}>
                {fracas.length === 0 ? <p style={{color: 'var(--text-3)', fontSize: 14, padding: '20px', textAlign: 'center'}}>¡Increíble! Dominas todas las áreas practicadas.</p> : null}
                {fracas.map((m) => (
                  <div key={m.materiaId} className={s.subjectCard}>
                    <div className={s.subjectRow}>
                      <span className={s.subjectName}>{m.materiaNombre}</span>
                      <div className={`${s.subjectScore} ${m.tendencia === 'mejorando' ? s.scoreMejorando : m.tendencia === 'bajando' ? s.scoreBajando : s.scoreEstable}`}>
                        <TendenciaIcon tendencia={m.tendencia} /> {m.porcentajeAcierto}%
                      </div>
                    </div>
                    <div className={s.progressTrack}>
                      <div className={s.progressFill} style={{ width: `${m.porcentajeAcierto}%`, background: '#ef4444' }} />
                    </div>
                    <p className={s.subjectMeta}>{m.totalRespondidas} preguntas estudiadas</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

