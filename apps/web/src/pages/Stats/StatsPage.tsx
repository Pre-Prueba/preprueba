import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Clock, Target, BookOpen,
  ArrowRight, ChevronRight, Layers
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useStats } from '../../hooks/useStats';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { PipoEmptyState, PipoMascot } from '../../components/PipoMascot';
import s from './Stats.module.css';

/* ── PIPO Mascote ── */
function PIPOFace({ size = 72 }: { size?: number }) {
  return <PipoMascot variant="face" size={size} motion="idle" title="PIPO" />;
}

/* ── Gauge circular ── */
function MiniGauge({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#355CF5" strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: 'var(--text-1)' }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ icon, label, value, trend, trendLabel, delay, trendType = 'up' }: {
  icon: React.ReactNode; label: string; value: string; trend: string; trendLabel: string; delay: number; trendType?: 'up' | 'down' | 'neutral';
}) {
  return (
    <motion.div
      className={s.kpiCard}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <div className={s.kpiTop}>
        <div className={s.kpiIconWrap}>{icon}</div>
        <span className={s.kpiLab}>{label}</span>
      </div>
      <div className={s.kpiValue}>{value}</div>
      <div className={`${s.kpiTrendRow} ${trendType === 'up' ? s.kpiTrendUp : trendType === 'down' ? s.kpiTrendDown : s.kpiTrendNeutral}`}>
        {trendType === 'up' && <TrendingUp size={12} />}
        {trendType === 'down' && <TrendingDown size={12} />}
        <span>{trend}</span>
        <span className={s.kpiTrendSub}>{trendLabel}</span>
      </div>
    </motion.div>
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
  const sorted = useMemo(() => [...materiasConActividad].sort((a, b) => b.porcentajeAcierto - a.porcentajeAcierto), [materiasConActividad]);

  const temporalData = data?.weeklyEvolution ?? [];
  const accuracy = data?.porcentajeAcierto ?? 0;

  // Meta de hoy
  const todayGoal = 10;
  const total = data?.totalRespuestas ?? 0;
  const todayDone = Math.min(total % todayGoal || (total > 0 ? todayGoal : 0), todayGoal);
  const todayPct = Math.round((todayDone / todayGoal) * 100);

  // Dados mockados das 5 dimensões
  const radarData = useMemo(() => {
    const base = Math.max(accuracy, 30);
    return [
      { subject: 'Comprensión', A: Math.min(base + 4, 100), fullMark: 100 },
      { subject: 'Precisión', A: Math.min(base, 100), fullMark: 100 },
      { subject: 'Constancia', A: Math.min((data?.racha ?? 0) * 5 + 40, 100), fullMark: 100 },
      { subject: 'Velocidad', A: Math.min(110 - (data?.globalAvgTime ?? 45), 100), fullMark: 100 },
      { subject: 'Confianza', A: Math.min(base + 5, 100), fullMark: 100 },
    ];
  }, [accuracy, data?.racha, data?.globalAvgTime]);

  // Mock de erros frequentes
  const erroresFrecuentes = [
    { name: 'Estequiometría', count: 24 },
    { name: 'Funciones compuestas', count: 18 },
    { name: 'Fuerzas y movimiento', count: 15 },
  ];

  // Matéria mais fraca para recomendação
  const weakest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  if (loading && !data) {
    return (
      <div className={s.page}>
        <div className={s.loadingWrap}><div className={s.spinner} /></div>
      </div>
    );
  }

  if (subscriptionLocked) {
    return (
      <div className={s.page}>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Desempeño</h1>
          <p className={s.pageSubtitle}>Tu progreso, tu mejor guía.</p>
        </div>
        <PipoEmptyState
          className={s.emptyState}
          variant="focus"
          title="Estadísticas Avanzadas"
          description="Desbloquea análisis detallados activando tu suscripción Premium."
          actionLabel="Ver planes"
          onAction={() => navigate('/checkout')}
        />
      </div>
    );
  }

  if (data && data.totalRespuestas === 0) {
    return (
      <div className={s.page}>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Desempeño</h1>
          <p className={s.pageSubtitle}>Tu progreso, tu mejor guía.</p>
        </div>
        <PipoEmptyState
          className={s.emptyState}
          variant="hero"
          title="Tu viaje comienza aquí"
          description="Completa tu primera sesión para ver tu desempeño."
          actionLabel="Empezar a practicar"
          onAction={() => navigate('/practice')}
        />
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Desempeño</h1>
        <p className={s.pageSubtitle}>Tu progreso, tu mejor guía.</p>
      </div>

      {/* ══════════════════════════════════════════════════
          HERO ROW — PIPO + Meta
      ══════════════════════════════════════════════════ */}
      <div className={s.heroRow}>
        <motion.div
          className={s.heroCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <PIPOFace size={72} />
          <div className={s.heroContent}>
            <span className={s.heroBadge}>✦ MENTOR PIPO</span>
            <p className={s.heroTitle}>¡Buen trabajo, {user?.nombre?.split(' ')[0] || 'Usuario'}! 👋</p>
            <p className={s.heroDesc}>Vas por buen camino. Sigue así y verás grandes resultados.</p>
          </div>
          <svg className={s.heroArrow} viewBox="0 0 90 56" fill="none">
            <path d="M6 46 Q 24 52, 42 34 T 68 14" stroke="#355CF5" strokeWidth="2" strokeDasharray="5 5" fill="none" />
            <path d="M60 8 L68 14 L58 20" fill="#355CF5" />
          </svg>
        </motion.div>

        <motion.div
          className={s.metaCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <MiniGauge pct={todayPct} />
          <div className={s.metaInfo}>
            <span className={s.metaValue}>{todayDone}/{todayGoal}</span>
            <span className={s.metaLabel}>Meta de hoy<br/>progresos más para completar tu meta</span>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════
          KPI ROW
      ══════════════════════════════════════════════════ */}
      <div className={s.kpiRow}>
        <KpiCard
          icon={<Clock size={16} />}
          label="Horas de estudio"
          value="48h"
          trend="+12%"
          trendLabel="esta semana"
          trendType="up"
          delay={0.1}
        />
        <KpiCard
          icon={<BookOpen size={16} />}
          label="Preguntas respondidas"
          value="1.248"
          trend="+18%"
          trendLabel="esta semana"
          trendType="up"
          delay={0.15}
        />
        <KpiCard
          icon={<Target size={16} />}
          label="Acierto medio"
          value={`${accuracy}%`}
          trend="+7%"
          trendLabel="esta semana"
          trendType="up"
          delay={0.2}
        />
        <KpiCard
          icon={<Layers size={16} />}
          label="Materias activas"
          value={`${materiasConActividad.length}`}
          trend="Muy bien"
          trendLabel=""
          trendType="neutral"
          delay={0.25}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          MIDDLE ROW — 3 cards
      ══════════════════════════════════════════════════ */}
      <div className={s.middleRow}>
        {/* Evolución de acierto */}
        <motion.div
          className={s.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Evolución de acierto</span>
            <button className={s.cardFilter}>Esta semana ▾</button>
          </div>
          <div className={s.lineChartHolder}>
            <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <AreaChart data={temporalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcierto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#355CF5" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#355CF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 12 }}
                  formatter={(value: any) => [`${value}%`, 'Acierto']}
                />
                <Area type="monotone" dataKey="acierto" stroke="#355CF5" strokeWidth={2} fill="url(#colorAcierto)" dot={{ r: 3, fill: '#355CF5', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dimensiones de desempeño */}
        <motion.div
          className={s.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Dimensiones de desempeño</span>
          </div>
          <div className={s.radarChartHolder}>
            <ResponsiveContainer width="100%" height={190} minWidth={0}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Tú" dataKey="A" stroke="#355CF5" strokeWidth={2} fill="#355CF5" fillOpacity={0.12} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={s.legendRow}>
            <span className={s.legendItem}><span className={s.legendDot} style={{ background: '#355CF5' }} /> Tú</span>
            <span className={s.legendItem}><span className={s.legendDot} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} /> Promedio</span>
          </div>
        </motion.div>

        {/* Rendimiento por materia */}
        <motion.div
          className={s.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Rendimiento por materia</span>
            <button className={s.cardLink} onClick={() => navigate('/stats')}>
              Ver detalle <ChevronRight size={12} />
            </button>
          </div>
          <div className={s.materiaList}>
            {sorted.slice(0, 5).map((m) => (
              <div key={m.materiaId} className={s.materiaItem}>
                <span className={s.materiaName}>{m.materiaNombre}</span>
                <div className={s.materiaBarTrack}>
                  <motion.div
                    className={s.materiaBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.porcentajeAcierto}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className={s.materiaPct}>{m.porcentajeAcierto}%</span>
              </div>
            ))}
            {sorted.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>No hay datos todavía</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════
          BOTTOM ROW — Errores + PIPO
      ══════════════════════════════════════════════════ */}
      <div className={s.bottomRow}>
        {/* Errores más frecuentes */}
        <motion.div
          className={s.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Errores más frecuentes</span>
          </div>
          <div className={s.errorList}>
            {erroresFrecuentes.map((e, i) => (
              <div key={i} className={s.errorItem}>
                <div className={s.errorLeft}>
                  <div className={`${s.errorBullet} ${i < 2 ? s.errorBulletDone : ''}`} />
                  <span className={s.errorName}>{e.name}</span>
                </div>
                <span className={s.errorCount}>{e.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Acción recomendada por PIPO */}
        <motion.div
          className={s.pipoCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <div className={s.pipoContent}>
            <p className={s.pipoTitle}>Acción recomendada por PIPO</p>
            <p className={s.pipoDesc}>
              {weakest
                ? `Practica 15 preguntas de ${weakest.materiaNombre}. Área con más impacto esta semana.`
                : 'Empieza tu primera sesión de práctica hoy.'}
            </p>
            <button className={s.pipoBtn} onClick={() => navigate(weakest ? `/practice?materia=${weakest.materiaId}` : '/practice')}>
              Practicar ahora <ArrowRight size={14} />
            </button>
          </div>
          <PIPOFace size={56} />
        </motion.div>
      </div>
    </div>
  );
}

export default StatsPage;
