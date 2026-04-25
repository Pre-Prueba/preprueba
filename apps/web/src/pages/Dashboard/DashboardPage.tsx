import { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Zap, Target, TrendingUp, BookOpen, Trophy,
  ChevronRight, Play, Sparkles, CalendarDays, Clock,
  BarChart3, Layers, ChevronDown, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useMaterias } from '../../hooks/useMaterias';
import { useStats } from '../../hooks/useStats';
import s from './Dashboard.module.css';

/* ─────────────── Helpers ─────────────── */
function getDaysLeft(iso?: string) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

/* ─────────────── Animated counter ─────────────── */
function Count({ to, duration = 900, suffix = '' }: { to: number | null | undefined; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || to === null || to === undefined || isNaN(Number(to))) {
      if (to !== null && to !== undefined && !isNaN(Number(to))) {
        setVal(Number(to));
      }
      return;
    }
    setHasAnimated(true);
    let start = 0;
    const end = Number(to);
    if (start === end) {
      setVal(end);
      return;
    }
    const totalMil = duration;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(totalMil / (end - start)));
    const timer = setInterval(() => {
      start += increment;
      setVal(start);
      if (start === end) clearInterval(timer);
    }, Math.max(stepTime, 10));
    return () => clearInterval(timer);
  }, [to, duration, hasAnimated]);

  const displayVal = val !== null && val !== undefined ? val.toLocaleString('es-ES') : '0';
  return <span ref={ref}>{displayVal}{suffix}</span>;
}

/* ─────────────── Skeleton ─────────────── */
function Sk({ h = 16, w = '100%', r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return <div className={s.sk} style={{ height: h, width: w, borderRadius: r }} />;
}

function DashboardSkeleton() {
  return (
    <div className={s.page}>
      <div className={s.dashboardLayout}>
        <div className={s.mainCol}>
          <Sk h={180} r={20} />
          <div className={s.kpiRow}>
            {[0, 1, 2, 3].map(i => <Sk key={i} h={80} r={16} />)}
          </div>
          <Sk h={20} w="120px" />
          <div className={s.materiasGrid}>
            {[0, 1, 2, 3, 4, 5].map(i => <Sk key={i} h={110} r={16} />)}
          </div>
        </div>
        <div className={s.rightCol}>
          <Sk h={280} r={20} />
          <Sk h={200} r={20} />
          <Sk h={180} r={20} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────── PIPO image ─────────────── */
function PIPOImage({ className }: { className?: string }) {
  return (
    <div className={`${s.pipoWrap} ${className || ''}`}>
      <img src="/assets/Design%20sem%20nome.png" alt="PIPO" className={s.pipoImg} />
    </div>
  );
}

/* ─────────────── mitad.png face for footer card ─────────────── */
function PIPOFaceMitad({ size = 44 }: { size?: number }) {
  return <img src="/assets/mitad.png" alt="PIPO" width={size} height={size} style={{ display: 'block', borderRadius: 2, objectFit: 'cover' }} />;
}

/* ─────────────── Subject styles ─────────────── */
const SUBJECT_COLORS: Record<string, { sym: string }> = {
  'Lengua Castellana y Literatura': { sym: 'Lc' },
  'Historia de España': { sym: 'HE' },
  'Inglés': { sym: 'En' },
  'Biología': { sym: 'Bi' },
  'Química': { sym: 'Qm' },
  'Matemáticas Aplicadas a las CCSS': { sym: 'Ma' },
  'Geografía': { sym: 'Ge' },
  'Historia de la Filosofía': { sym: 'Hf' },
  'Historia del Arte': { sym: 'HA' },
  'Matemáticas': { sym: 'Mt' },
  'Física': { sym: 'Fs' },
};

function getSubjectStyle(name: string | null | undefined) {
  const safeName = name || 'Materia';
  if (SUBJECT_COLORS[safeName]) return SUBJECT_COLORS[safeName];
  const trimmed = safeName.trim();
  const words = trimmed.split(' ');
  const sym = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (trimmed.slice(0, 2) || '??').toUpperCase();
  return { sym };
}

/* ════════════════════════════════════════════════════════
   DASHBOARD PAGE — Exactamente como na imagem
   ════════════════════════════════════════════════════════ */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: loadingMaterias } = useMaterias();
  const { data: stats, isLoading: loadingStats } = useStats();

  const racha = stats?.racha ?? 0;
  const total = stats?.totalRespuestas ?? 0;
  const acierto = Math.round(stats?.porcentajeAcierto ?? 0);
  const daysLeft = getDaysLeft(user?.fechaExamen);

  const materiasPracticadas = useMemo(() =>
    (stats?.porMateria ?? []).filter((m: any) => m.totalRespondidas > 0),
    [stats]
  );

  const weakest = useMemo(() =>
    materiasPracticadas.length
      ? [...materiasPracticadas].sort((a: any, b: any) => a.porcentajeAcierto - b.porcentajeAcierto)[0]
      : null,
    [materiasPracticadas]
  );

  const todayGoal = 10;
  const todayDone = Math.min(total % todayGoal || (total > 0 ? todayGoal : 0), todayGoal);
  const todayPct = Math.round((todayDone / todayGoal) * 100);

  /* Mock data para widgets que ainda não têm API */
  const mockMateriasAll = [
    { id: 1, nombre: 'Lengua Castellana y Literatura', pct: 80 },
    { id: 2, nombre: 'Historia de España', pct: 70 },
    { id: 3, nombre: 'Inglés', pct: 65 },
    { id: 4, nombre: 'Biología', pct: 55 },
    { id: 5, nombre: 'Química', pct: 55 },
    { id: 6, nombre: 'Matemáticas Aplicadas a las CCSS', pct: 45 },
    { id: 7, nombre: 'Geografía', pct: 35 },
  ];

  const mockErrores = [
    { tema: 'Funciones exponenciales', materia: 'Matemáticas', veces: 3, prioridad: 'Alta' },
    { tema: 'Cinética química', materia: 'Química', veces: 2, prioridad: 'Alta' },
    { tema: 'Comentario de texto', materia: 'Lengua Castellana', veces: 2, prioridad: 'Media' },
    { tema: 'Meiosis y gametogénesis', materia: 'Biología', veces: 2, prioridad: 'Media' },
  ];

  const mockFlashcards = [
    { tema: 'Reacciones orgánicas', materia: 'Química', tarjetas: 24 },
    { tema: 'Biomoléculas', materia: 'Biología', tarjetas: 18 },
    { tema: 'Conectores y oraciones', materia: 'Lengua Castellana', tarjetas: 32 },
  ];

  const mockRanking = [
    { pos: 1, sigla: 'Qm', nombre: 'Química', pct: 65 },
    { pos: 2, sigla: 'En', nombre: 'Inglés', pct: 65 },
    { pos: 3, sigla: 'Lc', nombre: 'Lengua Castellana', pct: 60 },
  ];

  const mockActividad = [
    { dia: 'L', val: 35 },
    { dia: 'M', val: 65 },
    { dia: 'X', val: 25 },
    { dia: 'J', val: 45 },
    { dia: 'V', val: 75 },
    { dia: 'S', val: 30 },
    { dia: 'D', val: 15 },
  ];

  if (loadingMaterias || loadingStats) return <DashboardSkeleton />;

  return (
    <div className={s.page}>
      <div className={s.dashboardLayout}>

        {/* ══════════════════════════════════════════════════
            COLUNA PRINCIPAL
        ══════════════════════════════════════════════════ */}
        <div className={s.mainCol}>

          {/* ── HERO CARD ── */}
          <motion.div
            className={s.heroCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <PIPOImage className={s.heroMascot} />

            <div className={s.heroContent}>
              <div className={s.heroEyebrow}>
                <Sparkles size={12} />
                PIPO sugiere
              </div>
              <h2 className={s.heroTitle}>
                {weakest ? weakest.materiaNombre : 'Primera sesión'}
              </h2>
              <p className={s.heroDesc}>
                {weakest
                  ? `Acierto actual: ${weakest.porcentajeAcierto}%. Una sesión ahora puede cambiar tu semana.`
                  : 'Tu camino hacia la universidad empieza con la primera pregunta.'}
              </p>
              <div className={s.heroActions}>
                <button className={s.heroBtnMain} onClick={() => navigate('/practice')}>
                  <Play size={14} fill="currentColor" />
                  Practicar ahora
                </button>
                <button className={s.heroBtnGhost} onClick={() => navigate('/practice')}>
                  Elegir materia
                </button>
              </div>
            </div>

            <div className={s.heroRight}>
              {daysLeft !== null && (
                <div className={s.pauBadge}>
                  <CalendarDays size={14} />
                  PAU en {daysLeft} días
                </div>
              )}
              <svg className={s.heroDecor} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M18 92 C 50 92, 55 72, 70 70 C 85 68, 88 82, 78 82 C 68 82, 72 62, 100 50 C 128 38, 138 28, 142 18"
                  stroke="#7B96FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="3 5"
                  fill="none"
                />
                <path
                  d="M142 10 L144 18 L152 20 L144 22 L142 30 L140 22 L132 20 L140 18 Z"
                  fill="#355CF5"
                />
                <path
                  d="M18 88 L19 92 L23 93 L19 94 L18 98 L17 94 L13 93 L17 92 Z"
                  fill="#355CF5"
                />
              </svg>
            </div>
          </motion.div>

          {/* ── STATS ROW ── */}
          <motion.div
            className={s.kpiRow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {[
              { icon: <Flame size={18} />, val: racha, suf: '', lab: 'Días de racha', trend: '+2', trendUp: true },
              { icon: <BookOpen size={18} />, val: total, suf: '', lab: 'Preguntas respondidas', trend: '+18%', trendUp: true },
              { icon: <Target size={18} />, val: acierto, suf: '%', lab: 'Acierto medio', trend: '+6%', trendUp: true },
              { icon: <Layers size={18} />, val: materiasPracticadas.length || 8, suf: '', lab: 'Materias activas', trend: '=', trendUp: null },
            ].map(({ icon, val, suf, lab, trend, trendUp }, i) => (
              <div key={i} className={s.kpiChip}>
                <div className={s.kpiIcon}>{icon}</div>
                <div className={s.kpiBody}>
                  <span className={s.kpiVal}><Count to={val} suffix={suf} duration={800} /></span>
                  <span className={s.kpiLab}>{lab}</span>
                </div>
                {trend && (
                  <div className={`${s.kpiTrend} ${trendUp === true ? s.kpiTrendUp : trendUp === false ? s.kpiTrendDown : s.kpiTrendNeutral}`}>
                    {trendUp === true && <TrendingUp size={12} />}
                    {trendUp === false && <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} />}
                    {trendUp === null && <span style={{ fontSize: 12, fontWeight: 700 }}>=</span>}
                    <span>{trend}</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* ── TABS + MATERIAS ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className={s.tabsHeader}>
              <div className={s.tabsList}>
                <button className={`${s.tab} ${s.tabActive}`}>Mis materias</button>
                <button className={s.tab}>Actividad reciente</button>
              </div>
              <button className={s.verTodoLink} onClick={() => navigate('/stats')}>
                Ver todas <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>

          <motion.div
            className={s.materiasGrid}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {(materiasPracticadas.length > 0 ? materiasPracticadas : mockMateriasAll.map((m) => ({
              materiaId: m.id,
              materiaNombre: m.nombre,
              porcentajeAcierto: m.pct,
            }))).slice(0, 5).map((m: any, idx: number) => {
              const st = getSubjectStyle(m.materiaNombre);
              const pct = m.porcentajeAcierto;
              return (
                <motion.div
                  key={m.materiaId}
                  className={s.materiaCard}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + idx * 0.04, duration: 0.3 }}
                  onClick={() => navigate('/practice')}
                >
                  <div className={s.materiaTop}>
                    <span className={s.materiaNum}>{idx + 1}</span>
                    <span className={s.materiaPct}>{pct}%</span>
                  </div>
                  <span className={s.materiaSymbol}>{st.sym}</span>
                  <span className={s.materiaName}>{m.materiaNombre}</span>
                  <div className={s.materiaTrack}>
                    <motion.div
                      className={s.materiaFill}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: pct / 100 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 + idx * 0.05 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── BOTTOM ROW: Repaso + Errores ── */}
          <motion.div
            className={s.bottomRow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            {/* Repaso inteligente */}
            <div className={s.bottomCard}>
              <div className={s.bottomCardHeader}>
                <div className={s.bottomCardHeaderLeft}>
                  <div>
                    <div className={s.bottomCardTitle}>Repaso inteligente</div>
                    <div className={s.bottomCardSubtitle}>Flashcards recomendadas para ti</div>
                  </div>
                </div>
                <button className={s.bottomCardArrow} onClick={() => navigate('/flashcards')}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className={s.flashcardsList}>
                {mockFlashcards.map((fc, i) => (
                  <div key={i} className={s.flashcardItem} onClick={() => navigate('/flashcards')}>
                    <div className={s.flashcardTitle}>{fc.tema}</div>
                    <div className={s.flashcardMeta}>{fc.materia}</div>
                    <div className={s.flashcardCount}>{fc.tarjetas} tarjetas</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mis errores */}
            <div className={s.bottomCard}>
              <div className={s.bottomCardHeader}>
                <div>
                  <div className={s.bottomCardTitle}>Mis errores para revisar</div>
                </div>
                <button className={s.verTodoLink} onClick={() => navigate('/errores')}>
                  Ver todos <ChevronRight size={14} />
                </button>
              </div>
              <div className={s.erroresList}>
                {mockErrores.map((err, i) => (
                  <div key={i} className={s.errorItem} onClick={() => navigate('/errores')}>
                    <div className={s.errorDot} />
                    <div className={s.errorInfo}>
                      <div className={s.errorTema}>{err.tema}</div>
                      <div className={s.errorMeta}>{err.materia} · Fallado {err.veces} veces</div>
                    </div>
                    <span className={`${s.errorTag} ${err.prioridad === 'Alta' ? s.errorTagHigh : s.errorTagMedium}`}>
                      {err.prioridad}
                    </span>
                    <ChevronRight size={14} className={s.errorChevron} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── PIPO ESTÁ CONTIGO ── */}
          <motion.div
            className={s.pipoFooterCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            onClick={() => navigate('/practice')}
          >
            <div className={s.pipoFooterImage}>
              <PIPOFaceMitad size={120} />
            </div>
            <div className={s.pipoFooterContent}>
              <div className={s.pipoFooterTitle}>PIPO está contigo</div>
              <div className={s.pipoFooterText}>Pequeños pasos hoy, grandes resultados en la PAU. ¡Tú puedes! 💪</div>
            </div>
            <ChevronRight size={18} className={s.pipoFooterChevron} />
          </motion.div>

        </div>

        {/* ══════════════════════════════════════════════════
            COLUNA DIREITA (SIDEBAR)
        ══════════════════════════════════════════════════ */}
        <div className={s.rightCol}>

          {/* ── META DE HOY ── */}
          <motion.div
            className={s.sideCard}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div className={s.sideCardHeader}>
              <span className={s.sideCardTitle}>Meta de hoy</span>
              <span className={s.sideCardValue}>{todayDone}/{todayGoal}</span>
            </div>

            <div className={s.goalRingWrap}>
              <svg width={110} height={110} style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="gr2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#355CF5" />
                    <stop offset="100%" stopColor="#4B6EF6" />
                  </linearGradient>
                </defs>
                <circle cx={55} cy={55} r={44} fill="none"
                  stroke="rgba(53,92,245,0.10)" strokeWidth={10} />
                <circle cx={55} cy={55} r={44} fill="none"
                  stroke="url(#gr2)" strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - todayPct / 100)}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
                />
              </svg>
              <div className={s.goalRingCenter}>
                <span className={s.goalPct}>{todayPct}%</span>
              </div>
            </div>

            <div className={s.goalDots}>
              {Array.from({ length: todayGoal }).map((_, i) => (
                <div key={i} className={`${s.goalDot} ${i < todayDone ? s.goalDotDone : ''}`} />
              ))}
            </div>
            <div className={s.goalCaption}>{todayDone} de {todayGoal} tareas completadas</div>

            <button className={s.sideBtn} onClick={() => navigate('/practice')}>
              <Zap size={14} />
              Completar meta
            </button>
          </motion.div>

          {/* ── MEJOR RENDIMIENTO ── */}
          <motion.div
            className={s.sideCard}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className={s.sideCardHeader}>
              <div className={s.sideCardHeaderLeft}>
                <Trophy size={16} className={s.sideCardIcon} />
                <span className={s.sideCardTitle}>Mejor rendimiento</span>
              </div>
            </div>
            <div className={s.rankingList}>
              {mockRanking.map((item) => (
                <div key={item.pos} className={s.rankingItem}>
                  <div className={s.rankingLeft}>
                    <span className={`${s.rankingPos} ${item.pos === 1 ? s.rankingPos1 : item.pos === 2 ? s.rankingPos2 : s.rankingPos3}`}>
                      {item.pos}º
                    </span>
                    <span className={s.rankingSigla}>{item.sigla}</span>
                    <span className={s.rankingName}>{item.nombre}</span>
                  </div>
                  <span className={s.rankingPct}>{item.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── PRÓXIMO SIMULACRO ── */}
          <motion.div
            className={s.sideCard}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className={s.sideCardHeader}>
              <div className={s.sideCardHeaderLeft}>
                <BarChart3 size={16} className={s.sideCardIcon} />
                <span className={s.sideCardTitle}>Próximo simulacro</span>
              </div>
            </div>
            <div className={s.simulacroCard}>
              <div className={s.simulacroName}>Simulacro PAU Completo</div>
              <div className={s.simulacroMeta}>
                <span><Clock size={12} /> 3h 30m</span>
                <span><BookOpen size={12} /> 90 preguntas</span>
                <span><CalendarDays size={12} /> PAU 2025</span>
              </div>
              <button className={s.sideBtn} onClick={() => navigate('/simulacros')}>
                Iniciar simulacro
              </button>
              <button className={s.sideLink} onClick={() => navigate('/simulacros')}>
                Ver todos los simulacros
              </button>
            </div>
          </motion.div>

          {/* ── ACTIVIDAD SEMANAL ── */}
          <motion.div
            className={s.sideCard}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            <div className={s.sideCardHeader}>
              <div className={s.sideCardHeaderLeft}>
                <Activity size={16} className={s.sideCardIcon} />
                <span className={s.sideCardTitle}>Actividad semanal</span>
              </div>
              <button className={s.sideDropdown}>
                Esta semana <ChevronDown size={12} />
              </button>
            </div>
            <div className={s.actividadTotal}>6h 20m</div>
            <div className={s.actividadChart}>
              {mockActividad.map((d, i) => (
                <div key={i} className={s.actividadBarWrap}>
                  <div className={s.actividadBarTrack}>
                    <motion.div
                      className={s.actividadBarFill}
                      initial={{ height: 0 }}
                      animate={{ height: `${d.val}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                  <span className={s.actividadDay}>{d.dia}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
