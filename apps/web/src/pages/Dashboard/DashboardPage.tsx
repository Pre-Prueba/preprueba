import { useMemo, useEffect, useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { useMaterias } from '../../hooks/useMaterias';
import { useStats } from '../../hooks/useStats';
import {
  fadeUp,
  staggerContainer,
  listItem,
  heroContainer,
  heroHeadline,
  scaleIn,
} from '../../lib/animations';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { TiltCard } from '../../components/ui/TiltCard';
import { MagneticButton } from '../../components/ui/MagneticButton';
import { useCountUp } from '../Landing/lib/useCountUp';
import s from './Dashboard.module.css';

/* ── Helpers ── */
function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDaysLeft(iso?: string) {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/* ── AnimatedNumber: count-up with reduced-motion support ── */
function AnimatedNumber({ value, suffix = '', duration = 900 }: {
  value: number; suffix?: string; duration?: number;
}) {
  const prefersReduced = useReducedMotion();
  const v = useCountUp(value, prefersReduced ? 0 : duration);
  return <>{v.toLocaleString('es-ES')}{suffix}</>;
}

/* ── Skeleton loading state ── */
function SkeletonBox({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div className={s.skeletonBox} style={{ width: w, height: h, borderRadius: r }} />
  );
}

function DashboardSkeleton() {
  return (
    <div className={s.page}>
      <div className={s.firstFold}>
        <div className={s.heroCard} style={{ flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
          <SkeletonBox h={13} w={100} r={6} />
          <SkeletonBox h={36} w={200} r={8} />
          <SkeletonBox h={16} w="75%" r={6} />
          <SkeletonBox h={16} w="55%" r={6} />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <SkeletonBox h={44} w={140} r={100} />
            <SkeletonBox h={44} w={120} r={100} />
          </div>
        </div>
        <div className={s.progressCard} style={{ gap: 20, alignItems: 'center' }}>
          <SkeletonBox h={148} w={148} r={74} />
          <SkeletonBox h={14} w={120} r={6} />
        </div>
      </div>
      <div className={s.metricsRow}>
        {[0, 1, 2, 3].map((i) => <SkeletonBox key={i} h={72} r={16} />)}
      </div>
      <SkeletonBox h={132} r={24} />
    </div>
  );
}

/* ── SVG Icons ── */
const IconFlame = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
  </svg>
);
const IconBook = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const IconTarget = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconLayers = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 3l1.88 5.76a1 1 0 00.95.69h6.17l-5 3.63a1 1 0 00-.36 1.12L17.52 20 12 16.37 6.48 20l1.88-5.8a1 1 0 00-.36-1.12l-5-3.63h6.17a1 1 0 00.95-.69L12 3z"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconTrendDown = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
);

/* ── Progress Ring ── */
const ProgressRing = ({ progress, size = 140, strokeWidth = 10, color = '#063399' }: {
  progress: number; size?: number; strokeWidth?: number; color?: string;
}) => {
  const [animated, setAnimated] = useState(0);
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * animated) / 100;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(Math.min(Math.max(progress, 0), 100)), 120);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#063399" />
          <stop offset="100%" stopColor="#052c85" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(6,51,153,0.08)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#ringGrad)" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
};

/* ── Hero Graphic ── */
const HeroGraphic = () => (
  <div className={s.heroGraphic} aria-hidden="true">
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="140" width="180" height="6" rx="3" fill="rgba(6, 51, 153, 0.06)"/>
      <rect x="20" y="140" width="126" height="6" rx="3" fill="url(#heroBarGrad)"/>
      <rect x="20" y="24" width="100" height="8" rx="4" fill="rgba(17,24,39,0.08)"/>
      <rect x="20" y="40" width="160" height="6" rx="3" fill="rgba(17,24,39,0.05)"/>
      <rect x="20" y="54" width="130" height="6" rx="3" fill="rgba(17,24,39,0.05)"/>
      <rect x="110" y="70" width="90" height="52" rx="10" fill="white" fillOpacity="0.7" stroke="rgba(6, 51, 153, 0.10)" strokeWidth="1"/>
      <rect x="120" y="82" width="40" height="5" rx="2.5" fill="rgba(6, 51, 153, 0.15)"/>
      <rect x="120" y="93" width="60" height="4" rx="2" fill="rgba(17,24,39,0.08)"/>
      <rect x="120" y="103" width="48" height="4" rx="2" fill="rgba(17,24,39,0.05)"/>
      <circle cx="185" cy="75" r="10" fill="rgba(6, 51, 153, 0.10)"/>
      <path d="M180 75l3 3 5-5" stroke="#063399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="52" cy="92" r="26" fill="none" stroke="rgba(6, 51, 153, 0.06)" strokeWidth="6"/>
      <circle cx="52" cy="92" r="26" fill="none" stroke="url(#heroRingGrad)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray="163.4" strokeDashoffset="49" style={{transform:'rotate(-90deg)', transformOrigin:'52px 92px'}}/>
      <text x="52" y="96" textAnchor="middle" fontFamily="-apple-system, sans-serif" fontSize="10" fontWeight="600" fill="#111827">70%</text>
      <defs>
        <linearGradient id="heroBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#063399"/>
          <stop offset="100%" stopColor="#052c85"/>
        </linearGradient>
        <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#063399"/>
          <stop offset="100%" stopColor="#052c85"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: materiasList = [], isLoading: loadingMaterias } = useMaterias();
  const { data: statsData, isLoading: loadingStats } = useStats();

  /* ── useInView refs ── */
  const subjectsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLDivElement>(null);

  const subjectsInView = useInView(subjectsRef, { once: true, margin: '-80px' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-60px' });
  const rankInView = useInView(rankRef, { once: true, margin: '-40px' });

  const firstName = user?.nombre?.split(' ')[0] ?? 'Estudiante';
  const racha = statsData?.racha ?? 0;
  const totalResps = statsData?.totalRespuestas ?? 0;
  const globalAci = Math.round(statsData?.porcentajeAcierto ?? 0);

  const materiasPraticadas = useMemo(() => {
    if (!statsData?.porMateria?.length) return [];
    return statsData.porMateria.filter((m: any) => m.totalRespondidas > 0);
  }, [statsData]);

  const weakest = useMemo(() => {
    if (!materiasPraticadas.length) return null;
    return [...materiasPraticadas].sort((a: any, b: any) => a.porcentajeAcierto - b.porcentajeAcierto)[0];
  }, [materiasPraticadas]);

  const best = useMemo(() => {
    if (!materiasPraticadas.length) return [];
    return [...materiasPraticadas].sort((a: any, b: any) => b.porcentajeAcierto - a.porcentajeAcierto).slice(0, 3);
  }, [materiasPraticadas]);

  const recommendation = useMemo(() => {
    if (!weakest) {
      return {
        title: 'Empieza tu primera sesión',
        reason: 'Aún no tienes actividad registrada. Tu progreso comienza con la primera pregunta.',
        path: '/practice',
      };
    }
    if (weakest.porcentajeAcierto < 50) {
      return {
        title: weakest.materiaNombre,
        reason: `Tu acierto en ${weakest.materiaNombre} es de ${weakest.porcentajeAcierto}%. Una sesión corta ahora puede marcar la diferencia esta semana.`,
        path: `/practice/${weakest.materiaId}`,
      };
    }
    return {
      title: 'Sesión de repaso general',
      reason: 'Estás yendo bien. Practica con variedad para consolidar tu rendimiento antes del examen.',
      path: '/practice',
    };
  }, [weakest]);

  const daysLeft = getDaysLeft(user?.fechaExamen);
  const examDateLabel = formatDate(user?.fechaExamen);
  const greeting = getGreeting();
  const pendingQs = weakest ? Math.max(0, 20 - (weakest.totalRespondidas % 20)) : 0;

  if (loadingMaterias || loadingStats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={s.page}>

      {/* ══════════════════════════════════════════
          PRIMERA DOBRA: Hero + Progress Ring
      ══════════════════════════════════════════ */}
      <div className={s.firstFold}>

        {/* HERO PRINCIPAL */}
        <div className={s.heroCard}>
          <div className={s.heroGlow} aria-hidden="true" />

          {/* E2: Staggered hero content reveal */}
          <motion.div
            className={s.heroContent}
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div className={s.heroMeta} variants={fadeUp}>
              <span className={s.heroGreeting}>{greeting}</span>
            </motion.div>

            <motion.h1 className={s.heroName} variants={heroHeadline}>
              {firstName}
            </motion.h1>

            <motion.p className={s.heroSubtitle} variants={fadeUp}>
              {racha > 0
                ? `Llevas ${racha} días consecutivos estudiando. Mantén el ritmo.`
                : 'Tu camino hacia la universidad comienza hoy. Empieza con una sesión.'}
            </motion.p>

            <motion.div className={s.heroChips} variants={fadeUp}>
              {racha > 0 && (
                <div className={s.chip}>
                  <span className={s.chipDot} style={{ background: '#f97316' }} />
                  <span>{racha} días de racha</span>
                </div>
              )}
              {pendingQs > 0 && (
                <div className={s.chip}>
                  <span className={s.chipDot} style={{ background: '#063399' }} />
                  <span>{pendingQs} preguntas pendientes</span>
                </div>
              )}
              {materiasPraticadas.length > 0 && (
                <div className={s.chip}>
                  <span className={s.chipDot} style={{ background: '#22c55e' }} />
                  <span>{materiasPraticadas.length} materias activas</span>
                </div>
              )}
            </motion.div>

            {/* R2: MagneticButton on primary CTA */}
            <motion.div className={s.heroActions} variants={fadeUp}>
              <MagneticButton className={s.btnPrimary} onClick={() => navigate('/practice')}>
                Practicar ahora
                <IconArrowRight />
              </MagneticButton>
              <button className={s.btnGhost} onClick={() => navigate('/stats')}>
                Ver mi progreso
              </button>
            </motion.div>
          </motion.div>

          {/* HeroGraphic slides in from right */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            <HeroGraphic />
          </motion.div>
        </div>

        {/* R1: TiltCard on Progress Card */}
        <TiltCard className={s.progressCard} maxTilt={5} scale={1.015}>
          <div className={s.progressCardHeader}>
            <span className={s.progressCardLabel}>Rendimiento global</span>
            <span className={s.progressCardBadge}>
              <IconTrendUp />
              Esta semana
            </span>
          </div>

          <div className={s.ringWrapper}>
            <ProgressRing progress={globalAci} size={148} strokeWidth={11} />
            <div className={s.ringCenter}>
              {/* E1: AnimatedNumber on ring center */}
              <span className={s.ringValue}>
                <AnimatedNumber value={globalAci} suffix="%" duration={1000} />
              </span>
              <span className={s.ringLabel}>de acierto</span>
            </div>
          </div>

          <div className={s.progressStats}>
            <div className={s.progressStat}>
              {/* E1: AnimatedNumber on stats */}
              <span className={s.progressStatValue}>
                <AnimatedNumber value={totalResps} duration={1200} />
              </span>
              <span className={s.progressStatLabel}>preguntas</span>
            </div>
            <div className={s.progressStatDivider} />
            <div className={s.progressStat}>
              <span className={s.progressStatValue}>
                <AnimatedNumber value={materiasPraticadas.length} duration={600} />
              </span>
              <span className={s.progressStatLabel}>materias</span>
            </div>
            <div className={s.progressStatDivider} />
            <div className={s.progressStat}>
              <span className={s.progressStatValue}>
                <AnimatedNumber value={racha} duration={800} />
              </span>
              <span className={s.progressStatLabel}>racha</span>
            </div>
          </div>

          {weakest && (
            <div className={s.progressHint}>
              <span className={s.progressHintLabel}>Punto débil</span>
              <span className={s.progressHintValue}>{weakest.materiaNombre}</span>
            </div>
          )}
        </TiltCard>
      </div>

      {/* ══════════════════════════════════════════
          METRICS ROW — E3: Individual stagger
      ══════════════════════════════════════════ */}
      <motion.div
        className={s.metricsRow}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div className={s.metricChip} variants={listItem}>
          <div className={s.metricIcon} style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316' }}>
            <IconFlame />
          </div>
          <div className={s.metricBody}>
            <span className={s.metricValue}>
              <AnimatedNumber value={racha} duration={800} />
            </span>
            <span className={s.metricLabel}>días de racha</span>
          </div>
        </motion.div>

        <motion.div className={s.metricChip} variants={listItem}>
          <div className={s.metricIcon} style={{ background: 'rgba(6, 51, 153, 0.07)', color: '#063399' }}>
            <IconBook />
          </div>
          <div className={s.metricBody}>
            <span className={s.metricValue}>
              <AnimatedNumber value={totalResps} duration={1200} />
            </span>
            <span className={s.metricLabel}>preguntas respondidas</span>
          </div>
        </motion.div>

        <motion.div className={s.metricChip} variants={listItem}>
          <div className={s.metricIcon} style={{ background: 'rgba(34,197,94,0.08)', color: '#16a34a' }}>
            <IconTarget />
          </div>
          <div className={s.metricBody}>
            <span className={s.metricValue}>
              <AnimatedNumber value={globalAci} suffix="%" duration={1000} />
            </span>
            <span className={s.metricLabel}>acierto medio</span>
          </div>
        </motion.div>

        <motion.div className={s.metricChip} variants={listItem}>
          <div className={s.metricIcon} style={{ background: 'rgba(6, 51, 153, 0.08)', color: 'var(--pp-blue)' }}>
            <IconLayers />
          </div>
          <div className={s.metricBody}>
            <span className={s.metricValue}>
              <AnimatedNumber value={materiasPraticadas.length} duration={600} />
            </span>
            <span className={s.metricLabel}>materias activas</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════
          CONTINÚA — R6: scaleIn + border-pulse
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1], delay: 0.25 }}
      >
        <div
          className={`${s.card} ${s.continueCard}`}
          onClick={() => navigate(weakest ? `/practice/${weakest.materiaId}` : '/practice')}
        >
          <div className={s.continueCardInner}>
            <div className={s.continueLeft}>
              <span className={s.continueTag}>Continúa donde lo dejaste</span>
              {weakest ? (
                <>
                  <div className={s.continueSubjectRow}>
                    <div className={s.continueBadge}>
                      {weakest.materiaNombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={s.continueSubjectName}>{weakest.materiaNombre}</h3>
                      <p className={s.continueMeta}>
                        {weakest.totalRespondidas} preguntas respondidas
                        <span className={s.continueDot} />
                        última sesión hoy
                      </p>
                    </div>
                  </div>
                  <div className={s.continueProgressWrap}>
                    <div className={s.continueProgressBar}>
                      <div className={s.continueProgressFill} style={{ width: `${weakest.porcentajeAcierto}%` }} />
                    </div>
                    <span className={s.continueProgressPct}>{weakest.porcentajeAcierto}%</span>
                  </div>
                </>
              ) : (
                <p className={s.continueEmpty}>Aún no tienes actividad. Comienza tu primera sesión de práctica.</p>
              )}
            </div>
            <div className={s.continueAction}>
              {/* R2: MagneticButton on CTA */}
              <MagneticButton
                className={s.btnPrimary}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(weakest ? `/practice/${weakest.materiaId}` : '/practice');
                }}
              >
                {weakest ? 'Continuar' : 'Comenzar'}
                <IconArrowRight />
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          MAIN GRID: Left + Sidebar
      ══════════════════════════════════════════ */}
      <div className={s.mainGrid}>
        <div className={s.mainLeft}>

          {/* ══ E4: SpotlightCard on IA Recommendation ══ */}
          <SpotlightCard
            className={`${s.card} ${s.recomCard}`}
            spotlightColor="rgba(6, 55, 164, 0.09)"
          >
            <div className={s.recomInner}>
              <div className={s.recomHeader}>
                <span className={s.iaBadge}>
                  <IconSparkle />
                  IA sugiere
                </span>
                <span className={s.recomHint}>Basado en tu historial</span>
              </div>
              <h3 className={s.recomTitle}>{recommendation.title}</h3>
              <p className={s.recomReason}>{recommendation.reason}</p>
              {/* R2: MagneticButton inside recom card */}
              <MagneticButton className={s.btnPrimary} onClick={() => navigate(recommendation.path)}>
                Practicar ahora
                <IconArrowRight />
              </MagneticButton>
            </div>
          </SpotlightCard>

          {/* ══ R4: Subject progress bars with scaleX + useInView ══ */}
          {materiasPraticadas.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h3 className={s.cardTitle}>Progreso por materias</h3>
                <button className={s.btnLink} onClick={() => navigate('/stats')}>Ver detalles</button>
              </div>
              <div className={s.cardBody}>
                <motion.div
                  ref={subjectsRef}
                  className={s.materiaList}
                  variants={staggerContainer}
                  initial="hidden"
                  animate={subjectsInView ? 'show' : 'hidden'}
                >
                  {materiasPraticadas.map((m: any, i: number) => {
                    const isUp = m.tendencia === 'mejorando';
                    const isDown = m.tendencia === 'bajando';
                    const pct = m.porcentajeAcierto;
                    const barColor = pct >= 70 ? '#16a34a' : pct >= 50 ? '#063399' : '#f97316';
                    return (
                      <motion.div key={m.materiaId} className={s.materiaRow} variants={listItem}>
                        <div className={s.materiaLeft}>
                          <div className={s.materiaInitial}>{m.materiaNombre.slice(0, 2).toUpperCase()}</div>
                          <div className={s.materiaDetails}>
                            <span className={s.materiaName}>{m.materiaNombre}</span>
                            <div className={s.materiaBarRow}>
                              <div className={s.materiaTrack}>
                                {/* scaleX instead of width — no layout thrash */}
                                <motion.div
                                  className={s.materiaFill}
                                  initial={{ scaleX: 0 }}
                                  animate={subjectsInView ? { scaleX: pct / 100 } : { scaleX: 0 }}
                                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                                  style={{ transformOrigin: 'left center', width: '100%', background: barColor + '99' }}
                                />
                              </div>
                              <span className={s.materiaPct}>{pct}%</span>
                            </div>
                          </div>
                        </div>
                        <span className={isUp ? s.trendUp : isDown ? s.trendDown : s.trendNeutral}>
                          {isUp ? <IconTrendUp /> : isDown ? <IconTrendDown /> : '—'}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}

          {/* ══ R3: Timeline stagger + dot pulse ══ */}
          {materiasPraticadas.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h3 className={s.cardTitle}>Actividad reciente</h3>
              </div>
              <div className={s.cardBody}>
                <motion.div
                  ref={timelineRef}
                  className={s.timeline}
                  variants={staggerContainer}
                  initial="hidden"
                  animate={timelineInView ? 'show' : 'hidden'}
                >
                  {materiasPraticadas.slice(0, 4).map((m: any, i: number) => {
                    const colors = ['#063399', '#16a34a', '#EF8F00', '#0a5bff'];
                    const labels = ['Hoy', 'Ayer', 'Hace 2 días', 'Hace 3 días'];
                    return (
                      <motion.div key={i} className={s.timelineItem} variants={listItem}>
                        <div className={s.timelineLine}>
                          <div
                            className={`${s.timelineDot} ${i === 0 ? s.timelineDotActive : ''}`}
                            style={{ background: colors[i % colors.length] }}
                          />
                          {i < materiasPraticadas.slice(0, 4).length - 1 && <div className={s.timelineConnector} />}
                        </div>
                        <div className={s.timelineContent}>
                          <div className={s.timelineRow}>
                            <span className={s.timelineSubject}>{m.materiaNombre}</span>
                            <span className={s.timelinePct} style={{ color: colors[i % colors.length] }}>{m.porcentajeAcierto}%</span>
                          </div>
                          <span className={s.timelineDate}>{labels[i]} · {m.totalRespondidas} preguntas</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className={s.mainRight}>

          {/* ══ MI OBJETIVO ══ */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h3 className={s.cardTitle}>Mi objetivo</h3>
            </div>
            <div className={s.objectiveBody}>
              {user?.fechaExamen ? (
                <>
                  {/* R6 / E1: ScaleIn + count-up on days left */}
                  <motion.div
                    className={s.objectiveDays}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.3 }}
                  >
                    <span className={s.objectiveDaysNum}>
                      <AnimatedNumber value={daysLeft} duration={1400} />
                    </span>
                    <span className={s.objectiveDaysLabel}>días restantes</span>
                  </motion.div>
                  <div className={s.objectiveDivider} />
                  <div className={s.objectiveDateRow}>
                    <IconCalendar />
                    <span>{examDateLabel}</span>
                  </div>
                  <button className={s.btnOutline} onClick={() => navigate('/settings')}>
                    Editar fecha
                  </button>
                </>
              ) : (
                <>
                  <p className={s.objectiveEmpty}>Configura la fecha de tu examen para ver cuánto tiempo te queda.</p>
                  <button className={s.btnOutline} onClick={() => navigate('/settings')}>
                    Configurar fecha
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ══ R5: Ranking — spring badge reveal ══ */}
          {best.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h3 className={s.cardTitle}>Mejor rendimiento</h3>
              </div>
              <div className={s.cardBody}>
                <motion.div
                  ref={rankRef}
                  className={s.rankList}
                  variants={staggerContainer}
                  initial="hidden"
                  animate={rankInView ? 'show' : 'hidden'}
                >
                  {best.map((m: any, i: number) => {
                    const medals = ['#f59e0b', '#9ca3af', '#cd7c3e'];
                    return (
                      <motion.div key={i} className={s.rankItem} variants={listItem}>
                        <motion.div
                          className={s.rankPosition}
                          style={{ color: medals[i], borderColor: medals[i] + '30', background: medals[i] + '0F' }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={rankInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 + i * 0.08 }}
                        >
                          {i + 1}
                        </motion.div>
                        <span className={s.rankName}>{m.materiaNombre}</span>
                        <span className={s.rankPct}>{m.porcentajeAcierto}%</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
